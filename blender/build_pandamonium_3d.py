"""Build the PandaMonium 3D roster-card prototype.

Run:
  blender --background --factory-startup --python blender/build_pandamonium_3d.py

Exports an editable .blend, a web GLB, and a studio-rendered preview. The
character is an original 3D interpretation of the approved 2D player art.
"""

import math
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "assets" / "3d"
OUT.mkdir(parents=True, exist_ok=True)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)


def material(name, color, metal=0.0, rough=0.65, emission=None, strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*color, 1)
    shader.inputs["Metallic"].default_value = metal
    shader.inputs["Roughness"].default_value = rough
    if emission:
        shader.inputs["Emission Color"].default_value = (*emission, 1)
        shader.inputs["Emission Strength"].default_value = strength
    return mat


fur_white = material("smoke-stained ivory fur", (0.52, 0.51, 0.50), rough=0.98)
fur_shadow = material("panda charcoal fur", (0.012, 0.013, 0.017), rough=0.94)
fur_mid = material("fur muzzle shadow", (0.14, 0.14, 0.15), rough=0.93)
armor = material("scratched graphite armor", (0.042, 0.047, 0.057), 0.57, 0.42)
armor_edge = material("steel edge", (0.13, 0.15, 0.17), 0.65, 0.35)
hood = material("black ballistic cloth", (0.018, 0.019, 0.025), 0.0, 0.84)
hood_inner = material("hood inner blackout", (0.007, 0.008, 0.012), 0.0, 0.93)
red = material("8iT signal red", (0.72, 0.004, 0.035), 0.36, 0.34)
red_glow = material("red LED", (0.88, 0.013, 0.045), 0.05, 0.28, (1, 0.013, 0.035), 2.0)
eye = material("scarlet eyes", (0.65, 0.02, 0.018), 0.0, 0.22, (1, 0.025, 0.006), 1.4)
nose_mat = material("black nose", (0.006, 0.006, 0.008), 0.13, 0.33)


def assign(obj, mat, name=None):
    if name:
        obj.name = name
    obj.data.materials.append(mat)
    return obj


def ellipsoid(name, loc, scale, mat, segments=32, rings=20):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=loc)
    ob = assign(bpy.context.object, mat, name)
    ob.scale = scale
    for face in ob.data.polygons:
        face.use_smooth = True
    return ob


def cylinder(name, loc, radius, depth, mat, rot=(0, 0, 0), verts=32):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=loc, rotation=rot)
    ob = assign(bpy.context.object, mat, name)
    bevel = ob.modifiers.new("machined edge", "BEVEL")
    bevel.width = min(radius, depth) * 0.12
    bevel.segments = 2
    ob.modifiers.new("corner normals", "WEIGHTED_NORMAL")
    return ob


def box(name, loc, scale, mat, bevel=0.06, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    ob = assign(bpy.context.object, mat, name)
    ob.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = ob.modifiers.new("soft armored edge", "BEVEL")
        mod.width = bevel
        mod.segments = 2
        ob.modifiers.new("corner normals", "WEIGHTED_NORMAL")
    return ob


def tube(name, points, radius, mat, cyclic=False):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 16
    curve.bevel_depth = radius
    curve.bevel_resolution = 4
    path = curve.splines.new("BEZIER")
    path.bezier_points.add(len(points) - 1)
    for bp, pt in zip(path.bezier_points, points):
        bp.co = pt
        bp.handle_left_type = "AUTO"
        bp.handle_right_type = "AUTO"
    path.use_cyclic_u = cyclic
    ob = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(ob)
    ob.data.materials.append(mat)
    return ob


def rod(name, start, end, radius, mat):
    delta = Vector(end) - Vector(start)
    middle = (Vector(start) + Vector(end)) * 0.5
    ob = cylinder(name, middle, radius, delta.length, mat, verts=12)
    ob.rotation_euler = delta.to_track_quat("Z", "Y").to_euler()
    return ob


def ring(name, center, major, minor, mat, rotation=(0, 0, 0), scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_torus_add(major_segments=48, minor_segments=10, location=center, rotation=rotation, major_radius=major, minor_radius=minor)
    ob = assign(bpy.context.object, mat, name)
    ob.scale = scale
    for face in ob.data.polygons:
        face.use_smooth = True
    return ob


# Solid rear silhouette: the back is finished, not a camera-facing cardboard cutout.
ellipsoid("heavy hood shell | full back", (0, 0.30, 1.89), (0.91, 0.70, 0.94), hood)
ellipsoid("rear hood panel", (0, 0.82, 1.82), (0.78, 0.30, 0.78), armor)
ellipsoid("torso under-armor", (0, 0.10, 0.78), (1.05, 0.63, 0.89), hood)
ellipsoid("rear armored vest", (0, 0.61, 0.85), (0.89, 0.23, 0.68), armor)
for x in (-0.56, 0.56):
    box("rear plate seam", (x, 0.82, 0.81), (0.06, 0.035, 0.87), armor_edge, 0.02)
for z in (0.48, 0.73, 0.98):
    box("rear vest ridge", (0, 0.84, z), (1.18, 0.045, 0.05), armor_edge, 0.02)

# Black ears and face are true rounded volumes from every angle.
ellipsoid("panda black head fur", (0, -0.27, 1.98), (0.75, 0.59, 0.70), fur_shadow)
ellipsoid("panda ivory face", (0, -0.60, 1.98), (0.665, 0.41, 0.635), fur_white)
for side in (-1, 1):
    x = side * 0.63
    ellipsoid("rounded panda ear", (x, -0.19, 2.58), (0.28, 0.16, 0.30), fur_shadow)
    ellipsoid("ear inner velvet", (x, -0.34, 2.59), (0.16, 0.065, 0.18), fur_shadow)
    ellipsoid("charcoal eye patch", (side * 0.295, -0.924, 2.12), (0.258, 0.095, 0.218), fur_shadow)
    ellipsoid("lit red iris", (side * 0.292, -1.031, 2.09), (0.122, 0.025, 0.040), eye, 24, 16)
    ellipsoid("dark slit pupil", (side * 0.292, -1.057, 2.09), (0.020, 0.010, 0.036), nose_mat, 18, 12)
    ellipsoid("eye glint", (side * 0.305 - 0.027, -1.063, 2.105), (0.014, 0.007, 0.010), fur_white, 12, 8)
    tube("furrowed brow", [(side * 0.08, -1.002, 2.244), (side * 0.28, -1.025, 2.228), (side * 0.47, -0.934, 2.19)], 0.063, fur_shadow)

ellipsoid("broad white muzzle", (0, -0.945, 1.83), (0.34, 0.18, 0.18), fur_white)
ellipsoid("lower jaw", (0, -0.858, 1.659), (0.325, 0.12, 0.092), fur_mid)
ellipsoid("nose bridge", (0, -1.060, 1.865), (0.145, 0.085, 0.10), fur_white)
ellipsoid("black triangular nose", (0, -1.136, 1.82), (0.145, 0.062, 0.070), nose_mat)
tube("stern mouth", [(-0.18, -1.07, 1.672), (0, -1.09, 1.689), (0.18, -1.07, 1.672)], 0.011, nose_mat)

# Fabric opening with red seam, plus a solid hood visor and crown-facing cap.
face_ring = []
for i in range(17):
    a = i * 2 * math.pi / 16
    face_ring.append((0.76 * math.cos(a), -0.66, 1.99 + 0.75 * math.sin(a)))
tube("thick hood opening", face_ring[:-1], 0.125, hood_inner, True)
trim_ring = [(x * 1.052, -0.755, 1.99 + (z - 1.99) * 1.045) for x, _, z in face_ring]
tube("scarlet hood seam", trim_ring[:-1], 0.020, red, True)
box("armored cap visor", (0, -0.63, 2.63), (1.20, 0.40, 0.14), armor, 0.07, (0.12, 0, 0))
tube("visor red piping", [(-0.60, -0.84, 2.61), (0, -0.92, 2.59), (0.60, -0.84, 2.61)], 0.025, red)

# Over-ear broadcast headset and boom microphone.
tube("headset top arch", [(-0.77, -0.12, 2.33), (-0.55, -0.13, 2.76), (0, -0.11, 2.89), (0.59, -0.11, 2.76), (0.88, -0.12, 2.30)], 0.082, armor)
tube("headset outer red stripe", [(-0.68, -0.17, 2.52), (0, -0.17, 2.90), (0.72, -0.17, 2.54)], 0.021, red)
for side in (-1, 1):
    x = side * 0.89
    cylinder("headset ear cup housing", (x, -0.29, 2.06), 0.29, 0.15, armor, (0, math.pi / 2, 0))
    cylinder("ear cup face", (x + side * 0.095, -0.29, 2.06), 0.235, 0.06, hood, (0, math.pi / 2, 0))
    ring("ear cup signal ring", (x + side * 0.13, -0.29, 2.06), 0.20, 0.018, red_glow, (0, math.pi / 2, 0))
    cylinder("ear cup boss", (x + side * 0.137, -0.29, 2.06), 0.077, 0.026, red, (0, math.pi / 2, 0))
tube("broadcast mic boom", [(0.94, -0.35, 1.94), (0.95, -0.60, 1.83), (0.75, -0.94, 1.73), (0.48, -1.11, 1.71)], 0.025, armor_edge)
cylinder("broadcast mic capsule", (0.45, -1.12, 1.71), 0.048, 0.15, nose_mat, (0, math.pi / 2, 0))

# Breastplate, articulated arms, webbing, rivets and side-specific shoulder plates.
ellipsoid("front ballistic cuirass", (0, -0.52, 0.80), (0.83, 0.22, 0.67), armor)
box("upper sternum shield", (0, -0.73, 1.12), (0.56, 0.12, 0.29), armor_edge, 0.07)
box("lower sternum shield", (0, -0.76, 0.68), (0.60, 0.12, 0.50), armor, 0.08)
for side in (-1, 1):
    sx = side * 0.93
    ellipsoid("sleeve and upper arm", (side * 1.05, 0.04, 0.84), (0.39, 0.49, 0.70), hood)
    ellipsoid("rounded shoulder armor", (sx, -0.24, 1.15), (0.45, 0.45, 0.38), armor)
    box("shoulder armor laminate", (side * 0.98, -0.61, 1.12), (0.57, 0.10, 0.31), armor_edge, 0.06, (0, side * -0.14, 0))
    tube("shoulder trim red", [(side * 0.68, -0.61, 1.27), (side * 1.00, -0.65, 1.32), (side * 1.26, -0.55, 1.20)], 0.026, red)
    box("vertical chest webbing", (side * 0.52, -0.74, 0.74), (0.15, 0.10, 0.96), hood, 0.035, (0, side * 0.09, 0))
    for z in (0.44, 0.71, 0.98):
        box("webbing catch", (side * 0.52, -0.82, z), (0.22, 0.07, 0.07), armor_edge, 0.015)
    for z in (0.83, 1.12):
        cylinder("armor rivet", (side * 1.07, -0.68, z), 0.025, 0.025, armor_edge, (math.pi / 2, 0, 0), 12)
for z in (0.37, 0.54):
    box("waist armored band", (0, -0.65, z), (1.36, 0.12, 0.08), armor_edge, 0.025)
for side in (-1, 1):
    for z in (0.45, 0.67, 0.89):
        box("front plate segment", (side * 0.28, -0.855, z), (0.27, 0.045, 0.14), armor, 0.025)

# Official mark is used as a texture decal, never redrawn as text.
logo_path = ROOT / "public" / "assets" / "players-hq" / "8it-logo.png"
logo_image = bpy.data.images.load(str(logo_path))
logo_image.pack()
logo_mat = bpy.data.materials.new("official 8iT insignia | unaltered")
logo_mat.use_nodes = True
nodes = logo_mat.node_tree.nodes
shader = nodes.get("Principled BSDF")
image_node = nodes.new("ShaderNodeTexImage")
image_node.image = logo_image
logo_mat.node_tree.links.new(image_node.outputs["Color"], shader.inputs["Base Color"])
logo_mat.node_tree.links.new(image_node.outputs["Alpha"], shader.inputs["Alpha"])
logo_mat.surface_render_method = "DITHERED"
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0.862, 1.00), rotation=(math.pi / 2, 0, 0))
back_decal = assign(bpy.context.object, logo_mat, "official 8iT decal on back plate")
back_decal.scale = (0.76, 0.39, 1)

# Separate the product model from render-only studio elements for web export.
model_objects = list(bpy.context.scene.objects)
bpy.ops.object.select_all(action="DESELECT")
for ob in model_objects:
    ob.select_set(True)
bpy.context.view_layer.objects.active = model_objects[0]
bpy.ops.export_scene.gltf(filepath=str(OUT / "pandamonium-3d.glb"), export_format="GLB", use_selection=True, export_apply=True)

# A small studio preview makes the geometry inspectable without the website.
world = bpy.context.scene.world
world.color = (0.005, 0.003, 0.005)
bpy.ops.object.camera_add(location=(3.15, -6.9, 2.17))
camera = bpy.context.object
direction = Vector((0, -0.12, 1.45)) - camera.location
camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
camera.data.type = "ORTHO"
camera.data.ortho_scale = 4.4
bpy.context.scene.camera = camera
for name, loc, color, power, size in [
    ("soft face key", (-3.5, -4.5, 4.7), (0.75, 0.78, 0.90), 540, 3.2),
    ("signal red rim", (2.5, 2.0, 3.8), (1.0, 0.015, 0.05), 1450, 2.1),
    ("low red fill", (-2.4, -2.6, 0.5), (1.0, 0.06, 0.08), 180, 2.4),
]:
    bpy.ops.object.light_add(type="AREA", location=loc)
    light = bpy.context.object
    light.name = name
    light.data.energy = power
    light.data.color = color
    light.data.shape = "DISK"
    light.data.size = size
    light.rotation_euler = (Vector((0, 0, 1.4)) - light.location).to_track_quat("-Z", "Y").to_euler()
bpy.context.scene.render.engine = "BLENDER_EEVEE"
bpy.context.scene.render.resolution_x = 720
bpy.context.scene.render.resolution_y = 720
bpy.context.scene.render.resolution_percentage = 100
bpy.context.scene.render.film_transparent = True
bpy.context.scene.render.image_settings.file_format = "PNG"
bpy.context.scene.render.filepath = str(OUT / "pandamonium-3d-preview.png")
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / "blender" / "pandamonium-3d.blend"))
bpy.ops.render.render(write_still=True)
print("PandaMonium 3D export complete")
