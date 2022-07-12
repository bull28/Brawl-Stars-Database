import { useRef, Suspense } from "react";
import { useLoader, useFrame, Canvas } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "@react-three/drei";

interface ModelViewerProps {
  modelPath: string,
  hover: boolean,
  scale?: number,
  position?: [number, number, number]
}

const GltfModel = ({ modelPath, hover, scale = 40, position = [0, 0, 0] }: ModelViewerProps) => {
  const ref:any = useRef();
  const gltf = useLoader(GLTFLoader, modelPath);

  useFrame(() => (ref.current.rotation.y += (hover? 0 : 0.003)));
  
  return (
    <>
      <primitive
        ref={ref}
        object={gltf.scene}
        position={position}
        scale={scale}
      />
    </>
  );
};

const ModelViewer = ({ modelPath, hover, scale = 40, position = [0, -2.2, 0] }: ModelViewerProps) => {
  return (
    <Canvas>
      <ambientLight />
      <spotLight position={[10, 10, 10]} />
      <Suspense fallback={null}>
        <GltfModel modelPath={modelPath} hover={hover} scale={scale} position={position} />
        <OrbitControls />
      </Suspense> 
    </Canvas>
  );
};

export default ModelViewer;