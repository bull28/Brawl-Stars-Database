import { MutableRefObject } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useFrame, useLoader } from "@react-three/fiber";
import { Vector3 } from "three";

interface BackgroundSceneProps{
    file: string;
    modelPos: MutableRefObject<Vector3>;
}

const BackgroundScene = ({file, modelPos}: BackgroundSceneProps) => {
    // This component contains only a scene background.
    // The scene background can be moved according to which brawler
    // is in the scene using the modelPos ref. For now, only moving
    // in the y-direction is necessary.
    const gltf = useLoader(GLTFLoader, file);

    gltf.scene.traverse((object) => {
        object.frustumCulled = false;
    });

    useFrame(() => {
        if (gltf.scene.position.y !== modelPos.current.y){
            gltf.scene.position.y = modelPos.current.y;
        }
    });

    return (
        <>
            <primitive object={gltf.scene}/>
        </>
    );
}

export default BackgroundScene;
