const { Configuration, OpenAIApi } = require("openai");
const multer = require("multer");
const path = require("path");

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 4004;

const configuration = new Configuration({
  apiKey: "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",
});

const openai = new OpenAIApi(configuration);

const GPTFunction = async (text) => {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: text,
    temperature: 0.6,
    max_tokens: 250,
    top_p: 1,
    frequency_penalty: 1,
    presence_penalty: 1,
  });

  return response.data.choices[0].text;
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use("/uploads", express.static("uploads")); // used to serve the contents of an uploads folder.

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
});

app.get("/api", (req, res) => {
  res.json({
    message: "Hello World",
  });
});

app.post("/resume/create", upload.single("headshotImage"), async (req, res) => {
  const {
    fullName,
    currentPosition,
    currentLength,
    currentTechnologies,
    workHistory, // JSON format
  } = req.body;

  const workArray = JSON.parse(workHistory); //an array

  let database = []

  //group the values into an object

  const newEntry = {
    id: generateID(),
    fullName,
    image_url: `http://localhost:4004/uploads/${req.file.filename}`,
    currentPosition,
    currentLength,
    currentTechnologies,
    workHistory: workArray,
  };

  console.log(req.body);

  // loops through the items in the workArray and converts them to a string

  const remainderText = () => {
    let stringText = "";
    for (let i = 0; i < workArray.length; i++) {
      stringText += `${workArray[i].name} as a ${workArray[i].position}.`;
    }

    return stringText;
  };

  // The job description prompt
  const prompt1 = `I am writing a resume, my details are \n name: ${fullName} \n role: ${currentPosition} (${currentLength} years). \n I write in the technolegies: ${currentTechnologies}. Can you write a 100 words description for the top of the resume(first person writing)? `;

  // The job responsibilities prompt
  const prompt2 = `I am writing a resume, my details are \n name: ${fullName} \n role: ${currentPosition} (${currentLength} years). \n I write in the technolegies: ${currentTechnologies}. Can you write 10 points for a resume on what I am good at?`;

  // The job achievements prompt
  const prompt3 = `I am writing a resume, my details are \n name: ${fullName} \n role: ${currentPosition} (${currentLength} years). \n During my years I worked at ${
    workArray.length
  } companies. ${remainderText()} \n Can you write me 50 words for each company seperated in numbers of my succession in the company (in first person)?`;

  // Generate a GPT-3 result
  const objective = await GPTFunction(prompt1);
  const keypoints = await GPTFunction(prompt2);
  const jobResponsibilities = await GPTFunction(prompt3);

  const chatgptData = { objective, keypoints, jobResponsibilities };

  const data = {...newEntry, ...chatgptData};
  database.push(data);
  console.log(chatgptData);

  res.json({
    message: "Request successful!",
    data
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
