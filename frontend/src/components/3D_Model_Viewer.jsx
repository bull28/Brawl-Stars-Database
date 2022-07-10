import { useRef, Suspense } from "react";
import { useLoader, useFrame, Canvas } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls, Sky } from "@react-three/drei";


const GltfModel = ({ modelPath, hover, scale = 40, position = [0, 0, 0] }) => {
  const ref = useRef();
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

const ModelViewer = ({ modelPath, hover, scale = 40, position = [0, -2.2, 0] }) => {
  return (
    <Canvas>
      <ambientLight />
      <spotLight position={[10, 10, 10]} />
      <pointLight position={[-100, -100, 100]} intensity={1.5} />
      <Suspense fallback={null}>
        <GltfModel modelPath={modelPath} hover={hover} scale={scale} position={position} />
        <OrbitControls />
      </Suspense>
      <Sky distance={450} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
    </Canvas>
  );
};

export default ModelViewer;