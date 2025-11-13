import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ARSessionProvider, useXR } from "expo-xr";

export default function ARViewScreen() {
  const { mesh_url } = useLocalSearchParams<{ mesh_url?: string }>();
  const router = useRouter();

  if (!mesh_url) {
    return (
      <View style={styles.center}>
        <Text style={styles.msg}>No 3D mesh provided.</Text>
      </View>
    );
  }

  return (
    <ARSessionProvider>
      <ARView meshUrl={mesh_url} onBack={() => router.back()} />
    </ARSessionProvider>
  );
}

function ARView({ meshUrl, onBack }: { meshUrl: string; onBack: () => void }) {
  const glRef = useRef<any>(null);
  const { session } = useXR();

  const onContextCreate = async (gl: any) => {
    glRef.current = gl;

    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

    // THREE renderer
    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 1000);

    // Soft lighting
    const light = new THREE.HemisphereLight(0xffffff, 0x444444);
    scene.add(light);

    // Load your GLB mesh
    const loader = new THREE.GLTFLoader();
    loader.load(
      meshUrl,
      (gltf) => {
        const mesh = gltf.scene;
        mesh.scale.set(1, 1, 1);
        mesh.position.set(0, 0, 0);
        mesh.rotation.x = -Math.PI / 2; // lay flat on AR floor
        scene.add(mesh);
      },
      undefined,
      (err) => console.error("Mesh load error:", err)
    );

    const renderLoop = () => {
      requestAnimationFrame(renderLoop);

      if (session?.camera) {
        // Apply ARKit camera pose to THREE camera
        const { matrix } = session.camera;
        camera.matrix.fromArray(matrix);
        camera.matrix.decompose(camera.position, camera.quaternion, camera.scale);
        camera.updateMatrixWorld(true);
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    renderLoop();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />

      <View style={styles.overlay}>
        <Text style={styles.tip}>Move your phone to place the floorplan</Text>
        <Text style={styles.backBtn} onPress={onBack}>
          Back
        </Text>
      </View>
    </View>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  msg: { color: "#fff" },

  overlay: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  tip: {
    color: "#fff",
    fontWeight: "600",
    marginBottom: 12,
  },
  backBtn: {
    color: "#00c3ff",
    fontSize: 16,
    fontWeight: "700",
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
});
