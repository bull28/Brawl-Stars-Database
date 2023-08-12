import {Button, Flex} from "@chakra-ui/react";
import {useRef, Suspense, MutableRefObject, useEffect} from "react";
import {AnimationAction, AnimationMixer, LoopOnce, Object3D, PerspectiveCamera, Vector3} from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {Canvas, RootState, useFrame, useLoader, useThree} from "@react-three/fiber";
import {OrbitControls} from "@react-three/drei";
import BackgroundScene from "./BackgroundScene";
import api from "../helpers/APIRoute";

interface AnimationViewerProps{
    modelFile: string;
    winFile: string | undefined;
    loseFile: string | undefined;
    lightsFile: string | undefined;
    sceneFile: string | undefined;
    lightIntensity: number | undefined;
}

interface GltfModelProps{
    modelFile: string;
    winFile: string;
    loseFile: string;
    lightsFile: string;
    playing: MutableRefObject<number>;
    modelPos: MutableRefObject<Vector3>;
    hasBackground: boolean;
}

function GltfModel({modelFile, winFile, loseFile, lightsFile, playing, modelPos, hasBackground}: GltfModelProps){
    const gltf = useLoader(GLTFLoader, `${api}/image/${modelFile}`);
    const initialPose = new Map<string, Vector3>();

    // Store the initial pose so the reset button can set the pose back to it
    gltf.scene.traverse((object) => {
        object.frustumCulled = false;
        initialPose.set(object.name, object.position);
    });

    let mixer: AnimationMixer = new AnimationMixer(gltf.scene);
    let win: AnimationAction | undefined = undefined;
    let lose: AnimationAction | undefined = undefined;


    // clampWhenFinished makes it stay on the last frame instead of going back to the first
    const winAnimation = useLoader(GLTFLoader, `${api}/image/${winFile}`);
    if (winAnimation.animations.length > 0){
        win = mixer.clipAction(winAnimation.animations[0]);
        win.clampWhenFinished = true;
        win.setLoop(LoopOnce, 0);
    }
    const loseAnimation = useLoader(GLTFLoader, `${api}/image/${loseFile}`);
    if (loseAnimation.animations.length > 0){
        lose = mixer.clipAction(loseAnimation.animations[0]);
        lose.clampWhenFinished = true;
        lose.setLoop(LoopOnce, 0);
    }

    const BARBARIAN_KING: RootState = useThree();//i am allowed to have 1 bad variable name
    const sceneCamera = BARBARIAN_KING.camera;
    if (sceneCamera instanceof PerspectiveCamera && gltf.cameras.length > 0){
        // Camera position is stored in the "Camera" scene object
        // but camera parameters are stored in the gltf.cameras camera
        const modelCamera = gltf.scene.getObjectByName("Camera");
        if (modelCamera){
            sceneCamera.position.copy(modelCamera.position);

            // modelPos stores this model's distance from the origin.
            // When a scene background is displayed, it is translated by
            // that amount so the brawler stands on the ground in the scene.
            // This is easier than moving the model and the camera.
            if (gltf.scene.children[0].name === "Camera"){
                modelPos.current = gltf.scene.children[1].position;
            } else{
                modelPos.current = gltf.scene.children[0].position;
            }
        }
        const parameters = gltf.cameras[0] as PerspectiveCamera;

        // If there is a scene background, increase the FOV so more of the scene
        // can be visible at once.
        if (hasBackground === true){
            sceneCamera.fov = parameters.fov * 1.5;
        } else{
            sceneCamera.fov = parameters.fov;
        }
    }
    const lights = useLoader(GLTFLoader, `${api}/image/${lightsFile}`);
    BARBARIAN_KING.camera.children = [];
    BARBARIAN_KING.camera.add(lights.scene);

    BARBARIAN_KING.camera.updateProjectionMatrix();
    BARBARIAN_KING.scene.add(BARBARIAN_KING.camera);

    useFrame((state: RootState, delta: number) => {
        // Make the value of playing ref change based on what button the user clicks
        // It is usually always 0 every frame but when it changes to non 0 value then
        // it immediately triggers an action on the next frame which starts one of the
        // animations or resets one. The value is then changed back to 0.

        // This makes it so the component does not have to be re-rendered every time
        // the user clicks one of the animation buttons.
        if (playing.current === 1){
            mixer.stopAllAction();
            win?.play();
            playing.current = 0;
        } else if (playing.current === 2){
            mixer.stopAllAction();
            lose?.play();
            playing.current = 0;
        } else if (playing.current === 3){
            mixer.stopAllAction();
            if (initialPose.size > 0){
                gltf.scene.traverse((object) => {
                    const p = initialPose.get(object.name);
                    if (p !== void 0){
                        object.position.copy(p);
                    }
                })
            }
            playing.current = 0;
        }
        mixer.update(delta);
    });

    useEffect(() => {
        return (() => {
            // Reset the animation when the component is destroyed so if the
            // user comes back to the same page, any animation in progress
            // will not be stuck in a weird pose
            mixer.stopAllAction();
            if (initialPose.size > 0){
                gltf.scene.traverse((object) => {
                    const p = initialPose.get(object.name);
                    if (p !== void 0){
                        object.position.copy(p);
                    }
                })
            }
            playing.current = 0;
        });
    });

    return (
        <>
            <primitive object={gltf.scene}/>
        </>
    );
}

export default function AnimationViewer({modelFile, winFile, loseFile, lightsFile, sceneFile, lightIntensity}: AnimationViewerProps){
    const gltf = useLoader(GLTFLoader, `${api}/image/${modelFile}`);// this line does some stuff
    gltf.scene.traverse((object: Object3D) => {object.frustumCulled = false;});// and so does this one
    // If you remove these lines then darryl will disappear

    // Stores which button the user clicked on
    const animationRef = useRef<number>(0);
    const positionRef = useRef<Vector3>(new Vector3(0, 0, 0));

    return (
        <Flex w={"100%"} h={"100%"} flexDir={"column"} alignItems={"center"} pos={"relative"}>
            <Flex w={"100%"} h={"100%"} flexDir={"column"} bgImage={`${api}/image/misc/bg_3d_model.webp`} bgPos={"center"} bgSize={"cover"} bgRepeat={"no-repeat"}>
                <Canvas flat={true} camera={{fov: 40, position: [0, 0, 1]}}>
                    <Suspense fallback={null}>
                        {(sceneFile !== void 0 && sceneFile !== "") ? <BackgroundScene file={sceneFile} modelPos={positionRef}/> : <></>}
                        <ambientLight intensity={lightIntensity !== void 0 ? lightIntensity : 0.8}/>
                        <GltfModel modelFile={modelFile} winFile={winFile !== void 0 ? winFile : "misc/empty.glb"} loseFile={loseFile !== void 0 ? loseFile : "misc/empty.glb"} lightsFile={lightsFile !== void 0 ? lightsFile : "misc/default_lights.glb"} playing={animationRef} modelPos={positionRef} hasBackground={(sceneFile !== void 0 && sceneFile !== "")}/>
                        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} maxDistance={150}/>
                    </Suspense>
                </Canvas>
            </Flex>
            <Flex h={"5%"} w={"100%"} flexDir={"row"} justifyContent={"center"} pos={"absolute"} bottom={0}>
                <Button className={"heading-md"} isDisabled={(winFile === void 0)} h={"100%"} lineHeight={0} flex={1} onClick={() => {animationRef.current = 1;}}>Win</Button>
                <Button className={"heading-md"} isDisabled={(loseFile === void 0)} h={"100%"} lineHeight={0} flex={1} onClick={() => {animationRef.current = 2;}}>Lose</Button>
                <Button className={"heading-md"} isDisabled={(winFile === void 0 && loseFile === void 0)} h={"100%"} lineHeight={0} flex={1} onClick={() => {animationRef.current = 3;}}>Reset</Button>
            </Flex>
        </Flex>
    );
};
