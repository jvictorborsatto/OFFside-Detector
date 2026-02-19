# OFFside-Detector

🔍 About

OFFside-Detector is a browser-based application that allows users to upload an image (TV screenshot, photo, replay frame, etc.) and determine whether a player is in an offside position. 

The system applies geometric perspective correction based on vanishing point logic and manual marking of key reference points. 



---

🧠 How It Works

The system determines offside in four structured stages:

1️⃣ Field Direction Definition

The user marks two field lines that represent the same real-world direction (field width).
In reality, these lines are parallel.

The system extends these lines until they intersect.
The intersection defines the Vanishing Point (P). 

This vanishing point establishes the true perspective direction of the field and allows the system to analyze depth correctly.

---

2️⃣ Player Ground Projection Correction

Each player is marked using two points:

* Foot (contact with the ground)
* Most advanced body part

The issue:
The most advanced body part may be above ground (knee, shoulder, head).
Using this point directly would produce perspective error.

To correct this, the system automatically performs a projection onto the ground plane:

1. A vertical line (Z-axis direction) is traced from the advanced body part.
2. A ground-direction line (Y-axis direction) is traced from the foot.
3. The intersection of these two lines defines the corrected ground position.

This new intersection point represents the valid offside reference position.

---

3️⃣ Offside Line Construction 

After correction, the system draws a line:

* Starting from the projected ground point
* Following the depth direction toward the vanishing point of the X-axis

This line represents the perspectively correct offside line.

---

4️⃣ Final Comparison

The system then evaluates:

* Which projected point is more advanced in the attack direction?
* The comparison is performed along the vanishing-point depth direction (X-axis).

Decision logic:

* If the attacker’s projected point is beyond the defender → OFFSIDE
* Otherwise → LEGAL 

No real-world field measurements are used.
Only **relative position along the depth direction** is considered.

---

🛠️ How to Use 

1. Upload an image of a soccer play.
2. Mark two parallel field lines (e.g., penalty box lines).
3. Mark the defender:

   * First click: foot in contact with the ground
   * Second click: most advanced body part
4. Mark the attacker using the same logic.
5. The system computes and displays:

   ✅ LEGAL 
   ❌ OFFSIDE 



---

## 🎯 Key Features

* Fully browser-based (no installation required)
* Vanishing point–based perspective correction
* Ground-plane projection correction
* Depth-direction relative comparison

* Multilingual interface

---

## 🧰 Technologies Used

* HTML 
* CSS
* JavaScript (Canvas API)
* Projective geometry logic
