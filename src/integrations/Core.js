// Integration functions with improved mock handling
export const UploadFile = async ({ file }) => {
  // For now, we'll create a local file URL
  // In a real app, this would upload to a cloud storage service
  const fileUrl = URL.createObjectURL(file);

  return {
    file_url: fileUrl,
  };
};

export const ExtractDataFromUploadedFile = async ({
  file_url,
  json_schema,
}) => {
  // Mock OCR extraction - in a real app, this would use a service like Google Vision API
  // For now, we'll return some sample text based on common script formats

  const sampleTexts = [
    `HAMLET: To be or not to be, that is the question.
OPHELIA: My lord?
HAMLET: Whether 'tis nobler in the mind to suffer
The slings and arrows of outrageous fortune,
Or to take arms against a sea of troubles,
And by opposing end them.`,

    `ROMEO: But, soft! what light through yonder window breaks?
It is the east, and Juliet is the sun.
Arise, fair sun, and kill the envious moon,
Who is already sick and pale with grief,
That thou her maid art far more fair than she.`,

    `MACBETH: Is this a dagger which I see before me,
The handle toward my hand? Come, let me clutch thee.
I have thee not, and yet I see thee still.
Art thou not, fatal vision, sensible
To feeling as to sight? or art thou but
A dagger of the mind, a false creation,
Proceeding from the heat-oppressed brain?`,
  ];

  const randomText =
    sampleTexts[Math.floor(Math.random() * sampleTexts.length)];

  return {
    status: "success",
    output: {
      full_text: randomText,
    },
  };
};

export const InvokeLLM = async ({ prompt, response_json_schema }) => {
  // Mock LLM response - in a real app, this would use OpenAI, Claude, or similar
  // Parse the prompt to extract characters and lines

  const sampleResponses = [
    {
      characters: ["HAMLET", "OPHELIA"],
      dialogue_lines: [
        {
          character: "HAMLET",
          line: "To be or not to be, that is the question.",
          line_number: 1,
        },
        {
          character: "OPHELIA",
          line: "My lord?",
          line_number: 2,
        },
        {
          character: "HAMLET",
          line: "Whether 'tis nobler in the mind to suffer",
          line_number: 3,
        },
      ],
    },
    {
      characters: ["ROMEO", "JULIET"],
      dialogue_lines: [
        {
          character: "ROMEO",
          line: "But, soft! what light through yonder window breaks?",
          line_number: 1,
        },
        {
          character: "ROMEO",
          line: "It is the east, and Juliet is the sun.",
          line_number: 2,
        },
      ],
    },
    {
      characters: ["MACBETH"],
      dialogue_lines: [
        {
          character: "MACBETH",
          line: "Is this a dagger which I see before me,",
          line_number: 1,
        },
        {
          character: "MACBETH",
          line: "The handle toward my hand? Come, let me clutch thee.",
          line_number: 2,
        },
      ],
    },
  ];

  const randomResponse =
    sampleResponses[Math.floor(Math.random() * sampleResponses.length)];

  return randomResponse;
};
