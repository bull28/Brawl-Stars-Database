import { Button, Flex, Text } from "@chakra-ui/react";
import { useRef, Suspense, MutableRefObject, useEffect } from "react";
import { AmbientLight, AnimationAction, AnimationMixer, Color, DirectionalLight, LoopOnce, Object3D, PerspectiveCamera, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Canvas, RootState, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

interface AnimationViewerProps{
    modelFile: string,
    winFile: string | null,
    loseFile: string | null
}

interface GltfModelProps{
    modelFile: string,
    winFile: string,
    loseFile: string,
    playing: MutableRefObject<number>
}

const addLights = (camera: Object3D) => {
    const light1X = (Math.sqrt(6)-Math.sqrt(2))/4;
    const light1Y = 0.0;
    const light1Z = (Math.sqrt(6)+Math.sqrt(2))/4;
    const light2X = (Math.sqrt(2))/-4;
    const light2Y = (Math.sqrt(2))/-2;
    const light2Z = (Math.sqrt(6))/-4;

    
    // scene backround light
    const backroundLight = new AmbientLight();
    backroundLight.intensity = 1.5;
    backroundLight.color = new Color(0xffffff);


    // blue side light
    const light1Pos = new Object3D();
    light1Pos.position.set(light1X, light1Y, light1Z);

    const light1 = new DirectionalLight();
    light1.position.set(light1X * -1, light1Y * -1, light1Z * -1);
    light1.target = light1Pos;

    light1.intensity = 6.4;
    light1.color = new Color(0x24d6ff);//0xc0ffff an alternative color


    // white front light
    const light2Pos = new Object3D();
    light2Pos.position.set(light2X, light2Y, light2Z);//direction the light goes toward

    const light2 = new DirectionalLight();
    light2.position.set(light2X * -1, light2Y * -1, light2Z * -1);//position of the light
    light2.target = light2Pos;

    light2.intensity = 2.5;
    light2.color = new Color(0xdfdfdf);

    camera.children = [];//remove all existing lights so there are no duplicates
    camera.add(backroundLight);
    camera.add(light1);
    camera.add(light1Pos);
    camera.add(light2);
    camera.add(light2Pos);
}

const GltfModel = ({modelFile, winFile, loseFile, playing}: GltfModelProps) => {
    const gltf = useLoader(GLTFLoader, modelFile);
    const initialPose = new Map<string, Vector3>();

    // Store the initial pose so the reset button can set the pose back to it
    gltf.scene.traverse((object) => {
        object.frustumCulled = false;
        initialPose.set(object.name, object.position);
    });

    let mixer: AnimationMixer = new AnimationMixer(gltf.scene);
    let win: AnimationAction | null = null;
    let lose: AnimationAction | null = null;


    // clampWhenFinished makes it stay on the last frame instead of going back to the first
    const winAnimation = useLoader(GLTFLoader, winFile);
    if (winAnimation.animations.length > 0){
        win = mixer.clipAction(winAnimation.animations[0]);
        win.clampWhenFinished = true;
        win.setLoop(LoopOnce, 0);
    }
    const loseAnimation = useLoader(GLTFLoader, loseFile);
    if (loseAnimation.animations.length > 0){
        lose = mixer.clipAction(loseAnimation.animations[0]);
        lose.clampWhenFinished = true;
        lose.setLoop(LoopOnce, 0);
    }

    const BARBARIAN_KING: RootState = useThree();//i am allowed to have 1 bad variable name
    const sceneCamera = BARBARIAN_KING.camera;
    if (sceneCamera instanceof PerspectiveCamera){
        // Camera position is stored in the "Camera" scene object
        // but camera parameters are stored in the gltf.cameras camera
        const modelCamera = gltf.scene.getObjectByName("Camera");
        if (modelCamera){
            sceneCamera.position.copy(modelCamera.position);
        }
        const parameters = gltf.cameras[0] as PerspectiveCamera;
        sceneCamera.fov = parameters.fov;
    }
    // Refer to the long comment about how ugly frank is to see where all the numbers came from
    addLights(BARBARIAN_KING.camera);
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
                    if (p){
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
                    if (p){
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

const AnimationViewer = (({modelFile, winFile, loseFile}: AnimationViewerProps) => {
    const gltf = useLoader(GLTFLoader, modelFile);// this line does some stuff
    gltf.scene.traverse((object: Object3D) => {object.frustumCulled = false;});// and so does this one
    // If you remove these lines then darryl will disappear

    // Stores which button the user clicked on
    const animationRef = useRef<number>(0);

    return(
        <Flex w={"100%"} h={"100%"} flexDir={"column"}>
            <Canvas linear={true} camera={{fov: 40, position: [0, 0, 1]}}>
                <Suspense fallback={null}>
                    <GltfModel modelFile={modelFile} winFile={winFile ? winFile : "../image/misc/empty.glb"} loseFile={loseFile ? loseFile : "../image/misc/empty.glb"} playing={animationRef}/>
                    <OrbitControls/>
                </Suspense>
            </Canvas>
            <Flex h={"5%"} flexDir={"row"} justifyContent={"center"}>
                <Button disabled={(winFile === null)} h={"100%"} w={"33%"} onClick={() => {animationRef.current = 1;}}>
                    <Text fontSize={"md"} className={"heading-md"}>Win</Text>
                </Button>
                <Button disabled={(loseFile === null)} h={"100%"} w={"33%"} onClick={() => {animationRef.current = 2;}}>
                    <Text fontSize={"md"} className={"heading-md"}>Lose</Text>
                </Button>
                <Button disabled={(winFile === null && loseFile === null)} h={"100%"} w={"33%"} onClick={() => {animationRef.current = 3;}}>
                    <Text fontSize={"md"} className={"heading-md"}>Reset</Text>
                </Button>
            </Flex>
        </Flex>
    );
});

export default AnimationViewer;
