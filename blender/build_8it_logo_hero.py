"""Build a finished, two-sided 8iT logo for the website hero.

Outputs an editable Blender scene, front/back renders, and a textured GLB.
The authentic logo image is packed into Blender and embedded in the GLB.
"""

import json
from pathlib import Path

import bpy
import bmesh
from mathutils import Vector, geometry


ROOT = Path(__file__).resolve().parents[1]
OUT = Path(__file__).resolve().parent
WEB_OUT = ROOT / "public" / "assets" / "3d" / "8it-logo-hero.glb"
SOURCE = ROOT / "public" / "assets" / "players-hq" / "8it-logo.png"
outline = json.loads((OUT / "8iT_logo_outline.json").read_text(encoding="utf-8"))

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
logo_collection = bpy.data.collections.new("8iT HERO LOGO | complete front, edge, and back")
studio_collection = bpy.data.collections.new("Preview cameras and lighting | excluded from GLB")
bpy.context.scene.collection.children.link(logo_collection)
bpy.context.scene.collection.children.link(studio_collection)


def solid_material(name, color, metallic, roughness, emission=0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if emission:
        bsdf.inputs["Emission Color"].default_value = (*color, 1)
        bsdf.inputs["Emission Strength"].default_value = emission
    return mat


graphite = solid_material("01 | finished graphite front, back, and sides", (0.022, 0.025, 0.032), 0.77, 0.31)
crimson = solid_material("02 | continuous crimson perimeter", (0.55, 0.003, 0.016), 0.35, 0.3, 0.18)

width_pixels, height_pixels = outline["width"], outline["height"]
width = 7.65
height = width * height_pixels / width_pixels
points = [
    ((px - width_pixels / 2) * width / width_pixels,
     (height_pixels / 2 - py) * width / width_pixels)
    for px, py in outline["points"]
]
if sum(points[i][0] * points[(i + 1) % len(points)][1] - points[(i + 1) % len(points)][0] * points[i][1] for i in range(len(points))) < 0:
    points.reverse()


def extruded_outline(name, scale, depth, mat):
    outline_points = [(x * scale, y * scale) for x, y in points]
    count = len(outline_points)
    vertices = [(x, y, depth) for x, y in outline_points] + [(x, y, -depth) for x, y in outline_points]
    faces = []
    for triangle in geometry.tessellate_polygon([[Vector((x, y, 0)) for x, y in outline_points]]):
        indices = list(triangle)
        a, b, c = (outline_points[index] for index in indices)
        if (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) < 0:
            indices.reverse()
        faces.append(tuple(indices))
        faces.append(tuple(index + count for index in reversed(indices)))
    for index in range(count):
        next_index = (index + 1) % count
        faces.append((index, index + count, next_index + count, next_index))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    logo_collection.objects.link(obj)
    obj.data.materials.append(mat)
    audit = bmesh.new()
    audit.from_mesh(mesh)
    open_edges = sum(not edge.is_manifold for edge in audit.edges)
    audit.free()
    if open_edges:
        raise RuntimeError(f"{name} has {open_edges} open or nonmanifold edges")
    return obj


# Both relief layers are closed meshes: the rear is as solid and finished as the front.
rim = extruded_outline("01 | all-around red metal rim", 1.013, 0.115, crimson)
body = extruded_outline("02 | closed graphite relief body", 1.0, 0.18, graphite)

image = bpy.data.images.load(str(SOURCE), check_existing=True)
image.pack()
artwork = bpy.data.materials.new("03 | official 8iT artwork | both sides")
artwork.use_nodes = True
bsdf = artwork.node_tree.nodes.get("Principled BSDF")
bsdf.inputs["Metallic"].default_value = 0.08
bsdf.inputs["Roughness"].default_value = 0.43
bsdf.inputs["Emission Strength"].default_value = 0.45
texture = artwork.node_tree.nodes.new("ShaderNodeTexImage")
texture.image = image
texture.interpolation = "Linear"
links = artwork.node_tree.links
links.new(texture.outputs["Color"], bsdf.inputs["Base Color"])
links.new(texture.outputs["Color"], bsdf.inputs["Emission Color"])
links.new(texture.outputs["Alpha"], bsdf.inputs["Alpha"])
if hasattr(artwork, "surface_render_method"):
    artwork.surface_render_method = "DITHERED"


def artwork_face(name, z, back=False):
    verts = [
        (-width / 2, -height / 2, z),
        (width / 2, -height / 2, z),
        (width / 2, height / 2, z),
        (-width / 2, height / 2, z),
    ]
    face = (0, 3, 2, 1) if back else (0, 1, 2, 3)
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], [face])
    mesh.update()
    uv = mesh.uv_layers.new(name="Official logo UV")
    vertex_uv = ((0, 0), (1, 0), (1, 1), (0, 1))
    for loop in mesh.loops:
        uv.data[loop.index].uv = vertex_uv[loop.vertex_index]
    obj = bpy.data.objects.new(name, mesh)
    logo_collection.objects.link(obj)
    obj.data.materials.append(artwork)
    return obj


front = artwork_face("03 | official artwork - front", 0.205)
back = artwork_face("04 | official artwork - finished back", -0.205, back=True)
model_objects = (rim, body, front, back)

world = bpy.context.scene.world
world.use_nodes = True
world.node_tree.nodes.get("Background").inputs["Color"].default_value = (0.025, 0.027, 0.034, 1)
world.node_tree.nodes.get("Background").inputs["Strength"].default_value = 0.5


def light(name, location, color, energy, size):
    data = bpy.data.lights.new(name, "AREA")
    data.color = color
    data.energy = energy
    data.shape = "DISK"
    data.size = size
    obj = bpy.data.objects.new(name, data)
    studio_collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = (Vector((0, 0, 0)) - obj.location).to_track_quat("-Z", "Y").to_euler()


light("Front | soft neutral", (-3.6, 2.7, 5.2), (0.8, 0.88, 1), 450, 5)
light("Back | soft neutral", (3.5, -2.4, -5.2), (0.8, 0.88, 1), 450, 5)
light("Perimeter | crimson left", (-4, -3.8, 1.1), (1, 0.018, 0.03), 480, 3.6)
light("Perimeter | crimson right", (4, 3.8, -1.1), (1, 0.018, 0.03), 480, 3.6)


def camera(name, location):
    data = bpy.data.cameras.new(name)
    data.type = "ORTHO"
    data.ortho_scale = 9.25
    obj = bpy.data.objects.new(name, data)
    studio_collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = (Vector((0, 0, 0)) - obj.location).to_track_quat("-Z", "Y").to_euler()
    return obj


front_camera = camera("Camera | finished front", (0.5, -1.3, 9.7))
back_camera = camera("Camera | finished back", (-0.5, 1.3, -9.7))
edge_camera = camera("Camera | continuous side edge", (6.0, -2.0, 7.0))
scene = bpy.context.scene
scene.camera = front_camera
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = 48
scene.cycles.use_denoising = True
scene.render.resolution_x = 1600
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.film_transparent = False
scene.view_settings.view_transform = "Standard"
scene.view_settings.look = "None"

bpy.context.preferences.filepaths.save_version = 0
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == "VIEW_3D":
            area.spaces.active.region_3d.view_perspective = "CAMERA"
            area.spaces.active.region_3d.view_camera_zoom = 8
            area.spaces.active.shading.type = "MATERIAL"
bpy.ops.object.select_all(action="DESELECT")
body.select_set(True)
bpy.context.view_layer.objects.active = body
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "8iT_logo_hero.blend"))

# Export only the four model meshes. The studio stays editable in the .blend.
bpy.ops.object.select_all(action="DESELECT")
for obj in model_objects:
    obj.select_set(True)
bpy.context.view_layer.objects.active = body
export_result = bpy.ops.export_scene.gltf(filepath=str(WEB_OUT), export_format="GLB", use_selection=True, export_yup=True)
print(f"GLB_EXPORT={export_result}")

scene.camera = front_camera
scene.render.filepath = str(OUT / "8iT_logo_hero_front.png")
bpy.ops.render.render(write_still=True)
scene.camera = back_camera
scene.render.filepath = str(OUT / "8iT_logo_hero_back.png")
bpy.ops.render.render(write_still=True)
scene.camera = edge_camera
scene.render.filepath = str(OUT / "8iT_logo_hero_side.png")
bpy.ops.render.render(write_still=True)

print(f"SAVED_BLEND={OUT / '8iT_logo_hero.blend'}")
print(f"SAVED_GLB={WEB_OUT}")
print(f"SAVED_FRONT={OUT / '8iT_logo_hero_front.png'}")
print(f"SAVED_BACK={OUT / '8iT_logo_hero_back.png'}")
print(f"SAVED_SIDE={OUT / '8iT_logo_hero_side.png'}")
