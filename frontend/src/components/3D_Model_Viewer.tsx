import { useRef, Suspense } from "react";
import { useLoader, useThree, Canvas } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "@react-three/drei";
import { DirectionalLight, AmbientLight, Object3D, Color, PerspectiveCamera, Camera, Scene } from "three";

interface ModelViewerProps {
    modelPath: string,
    scale?: number,
    position?: [number, number, number]
}

const GltfModel = ({ modelPath, scale = 1.0, position = [0, 0, 0] }: ModelViewerProps) => {
    const ref: any = useRef();
    const gltf: any = useLoader(GLTFLoader, modelPath);

    const BARBARIAN_KING: any = useThree();//i am allowed to have 1 bad variable name
    const camera: Camera = BARBARIAN_KING.camera;
    const scene: Scene = BARBARIAN_KING.scene;

    
    for (let x in scene.children){
        if (scene.children[x].name !== ""){//THE KING HARD CODES AGAIN
            scene.children[x].traverse((object: Object3D) => {object.frustumCulled = false;});
        }
    }
    
    /*
    Note to self on how I got these hardcoded values///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    (so I can remember how to get them again when I finally decide to stop hardcoding stuff)

    By default the lights in blender point towards (0, 0, -1). The desired lights
    are then rotated and placed in the scene.

    The current lights used are one blue light and one white light
    The blue light is rotated 1/2 * pi about the x axis then 1/12 * pi about the z axis
    The white light is rotated 1/4 * pi about the x axis then 1/6 * pi about the z axis

    The directional light wants a position and a target so I can't just give it a rotation.
    I decided to use the original vector the light pointed towards (0, 0, -1), transform it
    based on which rotations were used in blender then set the target of the directional
    light to the resulting vector. Then, set the target in the opposite direction so the
    light points in the direction of the resulting vector.

    Multiply by the transformation matrix to get the resulting vector that the light points toward:

    I can't add in the angle symbol so I will use BUL instead...

    rotation about x axis:
    [    1         0         0    ]
    [    0      cos(BUL) -sin(BUL)]
    [    0      sin(BUL)  cos(BUL)]

    rotation about y axis:
    [ cos(BUL)     0      sin(BUL)]
    [    0         1         0    ]
    [-sin(BUL)     0      cos(BUL)]

    rotation about z axis:
    [ cos(BUL) -sin(BUL)     0    ]
    [ sin(BUL)  cos(BUL)     0    ]
    [    0         0         1    ]

    (copied here because I keep forgetting and don't want to spend more time deriving them again)

    Then, since the three library uses different coordinates and the model in blender was
    already rotated, all the coordinates are messed up and x, y, and z are all moved around.

    So, all you have to do is multiply by this matrix (on the left of course) and the coordinates
    will hopefully be correct

    [    1         0         0    ]
    [    0         0         1    ]
    [    0        -1         0    ]

    (don't ask how I got this)

    Finally, set the target of the directional light to the resulting vector after all the
    transformations and set the position of the directional light to the same vector but
    scalar multiplied by -1. For now that makes average looking lights which are good enough
    until frank complains he looks too ugly (though he still looks ugly no matter what you do)
    */

    
    // kinggolem told me to do this
    const light1X: number = (Math.sqrt(6)-Math.sqrt(2))/4;
    const light1Y: number = 0.0;
    const light1Z: number = (Math.sqrt(6)+Math.sqrt(2))/4;
    const light2X: number = (Math.sqrt(2))/-4;
    const light2Y: number = (Math.sqrt(2))/-2;
    const light2Z: number = (Math.sqrt(6))/-4;

    
    // scene backround light
    const backroundLight = new AmbientLight();
    backroundLight.intensity = 0.69;
    backroundLight.color = new Color(0xffffff);


    // blue side light
    const light1Pos: Object3D = new Object3D();
    light1Pos.position.set(light1X, light1Y, light1Z);

    const light1: DirectionalLight = new DirectionalLight();
    light1.position.set(light1X * -1, light1Y * -1, light1Z * -1);
    light1.target = light1Pos;

    light1.intensity = 1.6;
    //light1.color = new Color(0xc0ffff);//an alternative color
    light1.color = new Color(0x24d6ff);


    // white front light
    const light2Pos: Object3D = new Object3D();
    light2Pos.position.set(light2X, light2Y, light2Z);//direction the light goes toward

    const light2: DirectionalLight = new DirectionalLight();
    light2.position.set(light2X * -1, light2Y * -1, light2Z * -1);//position of the light
    light2.target = light2Pos;

    light2.intensity = 1.0;
    light2.color = new Color(0xdfdfdf);


    // if the lights are added as children of the camera object then
    // the lights will rotate with the camera, which is how it works
    // in the game
    camera.children = [];//remove all existing lights so there are no duplicates
    camera.add(backroundLight);
    camera.add(light1);
    camera.add(light1Pos);
    camera.add(light2);
    camera.add(light2Pos);
    
    scene.add(camera);
  
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

const ModelViewer = ({ modelPath, scale = 1.0, position = [0, 0, 0] }: ModelViewerProps) => {
    const gltf: any = useLoader(GLTFLoader, modelPath);//maybe there's a way to avoid using the loader again here???
    
    var camera: PerspectiveCamera = new PerspectiveCamera();
    var cameraObj: Object3D = new Object3D();

    // if the scene does contains a camera, use it
    if (gltf.cameras.length > 0){
        camera = gltf.cameras[0];
    }

    // if the scene did contain a camera, its parent should not be null
    // in that case, set cameraObj to the parent (the parent contains
    // the position of the camera which will be used later)
    if (camera.parent != null){
        cameraObj = camera.parent;
    } 
    // if the scene did not contain a camera, its parent will be null
    // because it wasn't set earlier. in this case, manually set the
    // camera properties to some default values (hardcoded ! ! !)
    else{
        camera.fov = 30;
        cameraObj.position.set(0, 0, 28);
    }

    return (
        <Canvas camera={{ fov: camera.fov, position: cameraObj.position}}>
            <Suspense fallback={null}>
                <GltfModel modelPath={modelPath} scale={scale} position={position} />
                <OrbitControls/>
            </Suspense> 
        </Canvas>
    );
};

export default ModelViewer;