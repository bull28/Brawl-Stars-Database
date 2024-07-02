import {Button, Flex, Text} from "@chakra-ui/react";
import {useRef, Suspense, MutableRefObject, useEffect, useMemo} from "react";
import {AnimationAction, AnimationMixer, LoopOnce, PerspectiveCamera, Vector3} from "three";
import {clone as cloneSkeleton} from "three/examples/jsm/utils/SkeletonUtils";
import {Canvas, RootState, useFrame, useThree} from "@react-three/fiber";
import {OrbitControls, useGLTF} from "@react-three/drei";
import {ErrorBoundary} from "react-error-boundary";
import cdn from "../helpers/CDNRoute";

interface AnimationViewerProps{
    modelFile: string;
    winFile?: string;
    loseFile?: string;
    lightsFile?: string;
    sceneFile?: string;
    lightIntensity?: number;
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

interface BackgroundSceneProps{
    file: string;
    modelPos: MutableRefObject<Vector3>;
}

interface Animations{
    mixer: AnimationMixer;
    win?: AnimationAction;
    lose?: AnimationAction;
}

function GltfModel({modelFile, winFile, loseFile, lightsFile, playing, modelPos, hasBackground}: GltfModelProps){
    const [gltf, winAnimation, loseAnimation, lights] = useGLTF([
        `${cdn}/image/${modelFile}`, `${cdn}/image/${winFile}`, `${cdn}/image/${loseFile}`, `${cdn}/image/${lightsFile}`
    ]);
    const initialPose = new Map<string, Vector3>();
    const clone = useMemo(() => cloneSkeleton(gltf.scene), [gltf.scene]);

    // Store the initial pose so the reset button can set the pose back to it
    clone.traverse((object) => {
        object.frustumCulled = false;
        initialPose.set(object.name, object.position);
    });

    const animations: Animations = {
        mixer: new AnimationMixer(clone),
    };

    // clampWhenFinished makes it stay on the last frame instead of going back to the first
    if (winAnimation.animations.length > 0){
        animations.win = animations.mixer.clipAction(winAnimation.animations[0]);
        animations.win.clampWhenFinished = true;
        animations.win.setLoop(LoopOnce, 0);
    }
    if (loseAnimation.animations.length > 0){
        animations.lose = animations.mixer.clipAction(loseAnimation.animations[0]);
        animations.lose.clampWhenFinished = true;
        animations.lose.setLoop(LoopOnce, 0);
    }

    const state = useThree();
    const sceneCamera = state.camera;
    if (sceneCamera instanceof PerspectiveCamera && gltf.cameras.length > 0){
        // Camera position is stored in the "Camera" scene object but camera parameters are stored in gltf.cameras camera
        const modelCamera = clone.getObjectByName("Camera");
        if (modelCamera){
            sceneCamera.position.copy(modelCamera.position);

            // modelPos stores this model's distance from the origin. When a scene background is displayed, it is
            // translated by that amount so the brawler stands on the ground in the scene.
            if (clone.children[0].name === "Camera"){
                modelPos.current = clone.children[1].position;
            } else{
                modelPos.current = clone.children[0].position;
            }
        }
        const parameters = gltf.cameras[0] as PerspectiveCamera;

        // If there is a scene background, increase the FOV so more of the scene can be visible at once.
        if (hasBackground === true){
            sceneCamera.fov = parameters.fov * 1.5;
        } else{
            sceneCamera.fov = parameters.fov;
        }
    }
    state.camera.children = [];
    state.camera.add(lights.scene);

    state.camera.updateProjectionMatrix();
    state.scene.add(state.camera);

    useFrame((_______________: RootState, delta: number) => {
        // Make the value of playing ref change based on what button the user clicks
        // It is usually always 0 every frame but when it changes to non 0 value then it immediately triggers an action
        // on the next frame which starts one of the animations or resets one. The value is then changed back to 0.

        // This makes it so the component does re-render every time the user clicks one of the animation buttons.
        if (playing.current === 1){
            animations.mixer.stopAllAction();
            if (animations.win !== undefined){
                animations.win.play();
            }
            playing.current = 0;
        } else if (playing.current === 2){
            animations.mixer.stopAllAction();
            if (animations.lose !== undefined){
                animations.lose.play();
            }
            playing.current = 0;
        } else if (playing.current === 3){
            animations.mixer.stopAllAction();
            if (initialPose.size > 0){
                clone.traverse((object) => {
                    const p = initialPose.get(object.name);
                    if (p !== undefined){
                        object.position.copy(p);
                    }
                })
            }
            playing.current = 0;
        }
        animations.mixer.update(delta);
    });

    useEffect(() => {
        return (() => {
            // Reset the animation when the component is destroyed so if the user comes back to the same page, any
            // animation in progress will not be stuck in a weird pose
            animations.mixer.stopAllAction();
            if (initialPose.size > 0){
                clone.traverse((object) => {
                    const p = initialPose.get(object.name);
                    if (p !== undefined){
                        object.position.copy(p);
                    }
                })
            }
            playing.current = 0;
        });
    });

    return (
        <primitive object={clone}/>
    );
}

function BackgroundScene({file, modelPos}: BackgroundSceneProps){
    // This component contains only a scene background.
    // The scene background can be moved according to which brawler is in the scene using the modelPos ref. For now,
    // only moving in the y-direction is necessary.
    const gltf = useGLTF(`${cdn}/image/${file}`);
    const clone = gltf.scene.clone();

    clone.traverse((object) => {
        object.frustumCulled = false;
    });

    useFrame(() => {
        if (clone.position.y !== modelPos.current.y){
            clone.position.y = modelPos.current.y;
        }
    });

    return (
        <primitive object={clone}/>
    );
}

function fallbackRender({error, resetErrorBoundary}: {error: Error; resetErrorBoundary: () => void;}){
    return (
        <Flex w={"100%"} h={"100%"} p={5} flexDir={"column"} className={"heading-md"}>
            <Text fontSize={"2xl"} color={"#f77"}>An error occurred loading the model</Text>
            <Text>{error.message}</Text>
            <Text>Try selecting a different model then press "Try again"</Text>
            <Button onClick={resetErrorBoundary} w={"fit-content"}>Try again</Button>
        </Flex>
    );
}

export default function AnimationViewer({modelFile, winFile, loseFile, lightsFile, sceneFile, lightIntensity}: AnimationViewerProps){
    // Stores which button the user clicked on
    const animationRef = useRef<number>(0);
    const positionRef = useRef<Vector3>(new Vector3(0, 0, 0));

    return (
        <Flex w={"100%"} h={"100%"} flexDir={"column"} alignItems={"center"} pos={"relative"}>
            <ErrorBoundary fallbackRender={fallbackRender}>
                <Flex w={"100%"} h={"100%"} flexDir={"column"} bgPos={"center"} bgSize={"cover"} bgRepeat={"no-repeat"}>
                    {modelFile === "" ?
                    <Flex p={5} pt={"4em"} className={"heading-md"} w={"100%"} justifyContent={"center"}>
                        <Text fontSize={"2xl"}>Select a model to view</Text>
                    </Flex>
                    :
                    <Canvas flat={true} camera={{fov: 40, position: [0, 0, 1]}} resize={{scroll: false}}>
                        <Suspense fallback={null}>
                            {(sceneFile !== undefined && sceneFile !== "") && <BackgroundScene file={sceneFile} modelPos={positionRef}/>}
                            <ambientLight intensity={lightIntensity !== undefined ? lightIntensity : 2.5}/>
                            <GltfModel 
                                modelFile={modelFile}
                                winFile={winFile !== undefined ? winFile : "misc/empty.glb"}
                                loseFile={loseFile !== undefined ? loseFile : "misc/empty.glb"}
                                lightsFile={lightsFile !== undefined ? lightsFile : "misc/default_lights.glb"}
                                playing={animationRef}
                                modelPos={positionRef}
                                hasBackground={(sceneFile !== undefined && sceneFile !== "")}
                            />
                            <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} maxDistance={150}/>
                        </Suspense>
                    </Canvas>
                    }
                </Flex>
                <Flex h={"5%"} w={"100%"} flexDir={"row"} justifyContent={"center"} pos={"absolute"} bottom={0}>
                    <Button className={"heading-md"} isDisabled={winFile === undefined} h={"100%"} lineHeight={0} flex={1} onClick={() => {animationRef.current = 1;}}>Win</Button>
                    <Button className={"heading-md"} isDisabled={loseFile === undefined} h={"100%"} lineHeight={0} flex={1} onClick={() => {animationRef.current = 2;}}>Lose</Button>
                    <Button className={"heading-md"} isDisabled={winFile === undefined && loseFile === undefined} h={"100%"} lineHeight={0} flex={1} onClick={() => {animationRef.current = 3;}}>Reset</Button>
                </Flex>
            </ErrorBoundary>
        </Flex>
    );
}
