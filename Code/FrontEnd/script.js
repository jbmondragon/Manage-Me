// Add student
async function addStudent() {
  const name = document.getElementById("name").value;
  const id = document.getElementById("id").value;

  const res = await fetch("/postData", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, id })
  });

  alert(await res.text());
}

// Update student
async function updateStudent() {
  const id = document.getElementById("updateId").value;
  const name = document.getElementById("updateName").value;

  const res = await fetch(`/update/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });

  const data = await res.json();
  alert("Updated: " + JSON.stringify(data));
}

// Delete student
async function deleteStudent() {
  const id = document.getElementById("deleteId").value;

  const res = await fetch(`/delete/${id}`, { method: "DELETE" });
  alert(await res.text());
}

// Fetch all students
async function fetchStudents() {
  const res = await fetch("/fetchData");
  const students = await res.json();

  const list = document.getElementById("studentList");
  list.innerHTML = "";

  students.forEach(student => {
    const li = document.createElement("li");
    li.textContent = `ID: ${student.id}, Name: ${student.name}`;
    list.appendChild(li);
  });
}
