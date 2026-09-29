"""Build an editable 3D 8iT logo from the exact supplied brand artwork.

Run the companion vectorize_8it_logo.py first, then:
blender --background --python blender/build_8it_logo.py
"""

import json
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[1]
OUT = Path(__file__).resolve().parent
LOGO = ROOT / "public" / "assets" / "players-hq" / "8it-logo.png"
OUTLINE = OUT / "8iT_logo_outline.json"
outline_data = json.loads(OUTLINE.read_text(encoding="utf-8"))

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

logo_collection = bpy.data.collections.new("8iT LOGO | editable layers")
studio_collection = bpy.data.collections.new("Studio | camera and lighting")
bpy.context.scene.collection.children.link(logo_collection)
bpy.context.scene.collection.children.link(studio_collection)


def material(name, color, metallic=0.0, roughness=0.4, emission=0.0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    node = mat.node_tree.nodes.get("Principled BSDF")
    node.inputs["Base Color"].default_value = (*color, 1)
    node.inputs["Metallic"].default_value = metallic
    node.inputs["Roughness"].default_value = roughness
    if emission:
        node.inputs["Emission Color"].default_value = (*color, 1)
        node.inputs["Emission Strength"].default_value = emission
    return mat


graphite = material("01 | bevelled graphite body", (0.027, 0.029, 0.034), 0.78, 0.26)
silver = material("02 | cold metallic edge", (0.21, 0.23, 0.25), 0.9, 0.2)
crimson = material("03 | signal-red depth layer", (0.52, 0.004, 0.018), 0.43, 0.3, 0.4)
backdrop_mat = material("Studio | charcoal backdrop", (0.008, 0.009, 0.014), 0.0, 0.9)

pixel_width = outline_data["width"]
pixel_height = outline_data["height"]
logo_width = 7.65
logo_height = logo_width * pixel_height / pixel_width
points = [
    ((pixel_x - pixel_width / 2) * logo_width / pixel_width,
     (pixel_height / 2 - pixel_y) * logo_width / pixel_width)
    for pixel_x, pixel_y in outline_data["points"]
]


def silhouette(name, z, scale, depth, bevel, mat):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "2D"
    curve.fill_mode = "BOTH"
    curve.resolution_u = 16
    curve.extrude = depth
    curve.bevel_depth = bevel
    curve.bevel_resolution = 3
    spline = curve.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for point, (x, y) in zip(spline.points, points):
        point.co = (x * scale, y * scale, 0, 1)
    spline.use_cyclic_u = True
    obj = bpy.data.objects.new(name, curve)
    logo_collection.objects.link(obj)
    obj.location.z = z
    obj.data.materials.append(mat)
    return obj


silhouette("01 | chrome rear edge", -0.26, 1.008, 0.045, 0.012, silver)
silhouette("02 | crimson extruded rim", -0.15, 1.018, 0.07, 0.018, crimson)
silhouette("03 | graphite relief body", -0.01, 1.0, 0.105, 0.021, graphite)

# Keep the authentic raster mark on the front: no redrawing or substitute font.
source_image = bpy.data.images.load(str(LOGO), check_existing=True)
source_image.pack()
front_mat = bpy.data.materials.new("04 | OFFICIAL 8iT ARTWORK | packed PNG")
front_mat.use_nodes = True
nodes = front_mat.node_tree.nodes
nodes.clear()
links = front_mat.node_tree.links
output = nodes.new("ShaderNodeOutputMaterial")
mix = nodes.new("ShaderNodeMixShader")
transparent = nodes.new("ShaderNodeBsdfTransparent")
surface = nodes.new("ShaderNodeEmission")
surface.inputs["Strength"].default_value = 1.0
texture = nodes.new("ShaderNodeTexImage")
texture.image = source_image
texture.interpolation = "Linear"
links.new(texture.outputs["Color"], surface.inputs["Color"])
links.new(texture.outputs["Alpha"], mix.inputs[0])
links.new(transparent.outputs[0], mix.inputs[1])
links.new(surface.outputs[0], mix.inputs[2])
links.new(mix.outputs[0], output.inputs["Surface"])

vertices = [
    (-logo_width / 2, -logo_height / 2, 0.137),
    (logo_width / 2, -logo_height / 2, 0.137),
    (logo_width / 2, logo_height / 2, 0.137),
    (-logo_width / 2, logo_height / 2, 0.137),
]
mesh = bpy.data.meshes.new("Official source image plane")
mesh.from_pydata(vertices, [], [(0, 1, 2, 3)])
mesh.update()
uv = mesh.uv_layers.new(name="Exact source UV")
for index, value in enumerate(((0, 0), (1, 0), (1, 1), (0, 1))):
    uv.data[index].uv = value
front = bpy.data.objects.new("04 | 8iT official front artwork", mesh)
logo_collection.objects.link(front)
front.data.materials.append(front_mat)


def area_light(name, location, color, energy, size):
    data = bpy.data.lights.new(name, "AREA")
    data.color = color
    data.energy = energy
    data.shape = "DISK"
    data.size = size
    obj = bpy.data.objects.new(name, data)
    studio_collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = (Vector((0, 0, 0)) - obj.location).to_track_quat("-Z", "Y").to_euler()


bpy.ops.mesh.primitive_plane_add(size=2, location=(0, 0, -0.7))
backdrop = bpy.context.object
backdrop.name = "Studio | matte black wall"
backdrop.scale = (15, 15, 1)
for collection in list(backdrop.users_collection):
    collection.objects.unlink(backdrop)
studio_collection.objects.link(backdrop)
backdrop.data.materials.append(backdrop_mat)

area_light("White key | sculpted edge", (-3.7, 3.3, 5.5), (0.8, 0.88, 1.0), 650, 5.0)
area_light("Crimson rim | lower edge", (2.8, -3.8, 2.9), (1.0, 0.025, 0.045), 720, 3.4)
area_light("Warm glint | crown", (1.5, 3.1, 4.2), (1.0, 0.83, 0.72), 320, 3.2)

world = bpy.context.scene.world
world.use_nodes = True
world.node_tree.nodes.get("Background").inputs["Color"].default_value = (0.025, 0.028, 0.038, 1)
world.node_tree.nodes.get("Background").inputs["Strength"].default_value = 0.45

camera_data = bpy.data.cameras.new("Logo hero camera")
camera = bpy.data.objects.new("Camera | 8iT logo relief", camera_data)
studio_collection.objects.link(camera)
camera.location = (0.5, -1.3, 9.7)
camera.rotation_euler = (Vector((0, 0, 0)) - camera.location).to_track_quat("-Z", "Y").to_euler()
camera_data.type = "ORTHO"
camera_data.ortho_scale = 9.25
bpy.context.scene.camera = camera

scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = 48
scene.cycles.use_denoising = True
scene.render.resolution_x = 1600
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.view_settings.view_transform = "Standard"
scene.view_settings.look = "None"
scene.render.film_transparent = False

bpy.context.preferences.filepaths.save_version = 0
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == "VIEW_3D":
            area.spaces.active.region_3d.view_perspective = "CAMERA"
            area.spaces.active.region_3d.view_camera_zoom = 8
            area.spaces.active.shading.type = "MATERIAL"
bpy.ops.object.select_all(action="DESELECT")
front.select_set(True)
bpy.context.view_layer.objects.active = front
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "8iT_logo_3D.blend"))

scene.render.filepath = str(OUT / "8iT_logo_3D_render.png")
bpy.ops.render.render(write_still=True)

# A second export is useful as a layer over site art or future graphics.
backdrop.hide_render = True
scene.render.film_transparent = True
scene.render.filepath = str(OUT / "8iT_logo_3D_transparent.png")
bpy.ops.render.render(write_still=True)

print(f"SAVED_BLEND={OUT / '8iT_logo_3D.blend'}")
print(f"SAVED_RENDER={OUT / '8iT_logo_3D_render.png'}")
print(f"SAVED_TRANSPARENT={OUT / '8iT_logo_3D_transparent.png'}")
