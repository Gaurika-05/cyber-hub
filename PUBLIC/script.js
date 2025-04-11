document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = document.getElementById("media").files[0];
  console.log(file)
  const formData = new FormData();
  formData.append("media", file);

  const resultBox = document.getElementById("resultBox");
  resultBox.textContent = "Analyzing...";

  try {
    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.error) {
      resultBox.textContent = "❌ Analysis failed.";
    } else {
      resultBox.innerHTML = `
        ✅ <strong>Analysis Completed</strong><br>
        File: ${data.filename}<br>
        Deepfake: ${data.deepfake ? "Yes" : "No"}<br>
        Confidence: ${data.confidence}<br>
        Info: ${data.analysis}
      `;
    }
  } catch (err) {
    resultBox.textContent = "❌ Error during analysis.";
  }
});