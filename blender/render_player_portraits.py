"""Render subtle, seamless 2.5D portrait loops from the approved artwork.

Run with Blender in background mode, for example:
  blender --background --factory-startup --python blender/render_player_portraits.py -- --save-blend

The source art is kept as the exact texture; the shallow relief and light move,
not the characters' identities, lettering, or painted details. Requires ffmpeg
on PATH to encode the PNG frames as WebM and MP4 loops for the site.
"""

import argparse
import math
import shutil
import subprocess
import sys
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "public" / "assets" / "players-hq"
OUTPUT = ROOT / "blender" / ".render-frames"
WEB_OUTPUT = ROOT / "public" / "assets" / "players-motion"
PLAYERS = (
    "panda-monium",
    "bitch-stewie",
    "ghettobird",
    "ghosted",
    "hano-sandy",
    "hello-turtlz",
    "titan101",
)


def parse_args():
    arguments = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", choices=PLAYERS)
    parser.add_argument("--frames", type=int, default=80)
    parser.add_argument("--size", type=int, default=480)
    parser.add_argument("--save-blend", action="store_true")
    return parser.parse_args(arguments)


def look_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


def make_material(name, color, metallic=0, roughness=0.5):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*color, 1)
    shader.inputs["Metallic"].default_value = metallic
    shader.inputs["Roughness"].default_value = roughness
    return material


def make_relief(image_path):
    # A soft central convexity creates parallax without changing the approved
    # painting or bending the player wordmark at the bottom of the square.
    divisions = 48
    width = 3.2
    vertices = []
    uvs = []
    faces = []
    for row in range(divisions + 1):
        v = row / divisions
        y = (v - 0.5) * width
        for column in range(divisions + 1):
            u = column / divisions
            x = (u - 0.5) * width
            head = math.exp(-((x / 1.14) ** 2 + ((y - 0.18) / 1.18) ** 2))
            wordmark_guard = min(1, max(0, (y + 0.76) / 0.42))
            depth = 0.18 * head * wordmark_guard
            vertices.append((x, y, depth))
            uvs.append((u, v))
    for row in range(divisions):
        for column in range(divisions):
            a = row * (divisions + 1) + column
            faces.append((a, a + 1, a + divisions + 2, a + divisions + 1))

    mesh = bpy.data.meshes.new("Soft portrait relief")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    uv_layer = mesh.uv_layers.new(name="Original artwork UVs")
    for polygon in mesh.polygons:
        for loop_index in polygon.loop_indices:
            uv_layer.data[loop_index].uv = uvs[mesh.loops[loop_index].vertex_index]

    image = bpy.data.images.load(str(image_path), check_existing=True)
    image.pack()
    material = bpy.data.materials.new("Approved portrait | exact texture")
    material.use_nodes = True
    nodes = material.node_tree.nodes
    shader = nodes.get("Principled BSDF")
    shader.inputs["Roughness"].default_value = 0.73
    shader.inputs["Metallic"].default_value = 0.04
    shader.inputs["Emission Strength"].default_value = 0.72
    texture = nodes.new("ShaderNodeTexImage")
    texture.name = "Unaltered source portrait"
    texture.image = image
    texture.interpolation = "Linear"
    material.node_tree.links.new(texture.outputs["Color"], shader.inputs["Base Color"])
    material.node_tree.links.new(texture.outputs["Color"], shader.inputs["Emission Color"])
    mesh.materials.append(material)

    relief = bpy.data.objects.new("Portrait | sculpted image surface", mesh)
    bpy.context.collection.objects.link(relief)
    return relief


def make_scene(player, frames, size, save_blend):
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for material in list(bpy.data.materials):
        bpy.data.materials.remove(material)
    for image in list(bpy.data.images):
        bpy.data.images.remove(image)

    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = size
    scene.render.resolution_y = size
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = False
    scene.render.image_settings.color_mode = "RGB"
    scene.render.fps = 20
    scene.render.fps_base = 1
    scene.frame_start = 1
    scene.frame_end = frames
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "Medium High Contrast"
    scene.view_settings.exposure = 0
    scene.view_settings.gamma = 1
    scene.world.color = (0.008, 0.008, 0.012)

    source = SOURCES / f"{player}.png"
    if not source.is_file():
        raise FileNotFoundError(source)
    relief = make_relief(source)

    graphite = make_material("Graphite | physical plate", (0.012, 0.014, 0.018), 0.45, 0.36)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, -0.11))
    plate = bpy.context.object
    plate.name = "Thin graphite card edge"
    plate.dimensions = (3.21, 3.21, 0.18)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bevel = plate.modifiers.new("Soft machined edge", "BEVEL")
    bevel.width = 0.025
    bevel.segments = 2
    plate.modifiers.new("Weighted edge normals", "WEIGHTED_NORMAL")
    plate.data.materials.append(graphite)

    pivot = bpy.data.objects.new("Portrait motion pivot", None)
    bpy.context.collection.objects.link(pivot)
    relief.parent = pivot
    plate.parent = pivot

    camera_data = bpy.data.cameras.new("Frontal portrait camera")
    camera = bpy.data.objects.new("Frontal portrait camera", camera_data)
    bpy.context.collection.objects.link(camera)
    scene.camera = camera
    camera.location = (0, 0, 7.5)
    look_at(camera, (0, 0, 0))
    camera_data.type = "ORTHO"
    camera_data.ortho_scale = 3.24
    camera_data.lens = 50

    def area_light(name, color, energy, location, size_x, size_y):
        data = bpy.data.lights.new(name, "AREA")
        data.color = color
        data.energy = energy
        data.shape = "RECTANGLE"
        data.size = size_x
        data.size_y = size_y
        obj = bpy.data.objects.new(name, data)
        bpy.context.collection.objects.link(obj)
        obj.location = location
        look_at(obj, (0, 0, 0))
        return obj

    area_light("Soft neutral key", (1, 1, 1), 150, (-1.5, 2.1, 4), 3.5, 3.5)
    red_sweep = area_light("Slow signal-red sweep", (1, 0.025, 0.045), 100, (-2.7, 0.5, 2.1), 0.38, 3.3)
    area_light("Red edge glow", (1, 0.015, 0.025), 50, (2.7, -1.2, 1.2), 1.0, 3.0)

    # Sine/cosine return to the starting pose at the loop boundary. The
    # movement stays under four degrees so names and silhouettes remain clear.
    for frame in range(1, frames + 1):
        phase = 2 * math.pi * (frame - 1) / frames
        pivot.rotation_euler = (
            math.radians(1.2) * math.sin(phase),
            math.radians(3.4) * math.cos(phase),
            math.radians(0.3) * math.sin(phase),
        )
        pivot.scale.z = 1 + 0.065 * math.sin(phase)
        red_sweep.location.x = -1.8 + 3.6 * (0.5 - 0.5 * math.cos(phase))
        pivot.keyframe_insert(data_path="rotation_euler", frame=frame)
        pivot.keyframe_insert(data_path="scale", frame=frame)
        red_sweep.keyframe_insert(data_path="location", frame=frame)
    (OUTPUT / player).mkdir(parents=True, exist_ok=True)
    scene.frame_set(1)
    if save_blend:
        bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / "blender" / "player_portrait_motion.blend"))
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = str(OUTPUT / player / "frame_")
    bpy.ops.render.render(animation=True)
    print(f"Rendered {player} frames: {OUTPUT / player}")


def encode_loop(player):
    encoder = shutil.which("ffmpeg")
    if not encoder:
        raise RuntimeError("ffmpeg is needed to encode portrait loops")
    WEB_OUTPUT.mkdir(parents=True, exist_ok=True)
    frames = str(OUTPUT / player / "frame_%04d.png")
    base = [encoder, "-hide_banner", "-loglevel", "error", "-y", "-framerate", "20", "-i", frames, "-an"]
    subprocess.run(base + ["-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "35", "-deadline", "good", "-cpu-used", "4", "-row-mt", "1", "-pix_fmt", "yuv420p", str(WEB_OUTPUT / f"{player}.webm")], check=True)
    subprocess.run(base + ["-c:v", "libx264", "-crf", "29", "-preset", "medium", "-movflags", "+faststart", "-pix_fmt", "yuv420p", str(WEB_OUTPUT / f"{player}.mp4")], check=True)
    print(f"Encoded {player} loop: {WEB_OUTPUT}")


if __name__ == "__main__":
    options = parse_args()
    for index, name in enumerate([options.only] if options.only else PLAYERS):
        make_scene(name, options.frames, options.size, options.save_blend and index == 0)
        encode_loop(name)
