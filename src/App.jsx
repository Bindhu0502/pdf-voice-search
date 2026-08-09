import { useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "./App.css";

pdfjs.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getWords(text) {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
    "do",
    "does",
    "did",
    "to",
    "of",
    "in",
    "on",
    "for",
    "and",
    "or",
    "what",
    "why",
    "how",
    "can",
    "you",
    "your",
    "i",
    "me",
    "my"
  ]);

  return normalizeText(text)
    .split(" ")
    .filter((word) => word.length > 2 && !stopWords.has(word));
}

function App() {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [spokenText, setSpokenText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [pageTexts, setPageTexts] = useState([]);
  const [matchedPage, setMatchedPage] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const pageRefs = useRef([]);

  // Extract text from every PDF page
  const extractPdfText = async (selectedFile) => {
    try {
      setIsExtracting(true);
      setPageTexts([]);
      setMatchedPage(null);

      const arrayBuffer = await selectedFile.arrayBuffer();

      const pdf = await pdfjs.getDocument({
        data: arrayBuffer
      }).promise;

      const extractedPages = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();

        const text = textContent.items
          .map((item) => item.str)
          .join(" ");

        extractedPages.push({
          pageNumber,
          text
        });
      }

      setPageTexts(extractedPages);
      setIsExtracting(false);

      console.log("PDF text extracted:", extractedPages);
    } catch (error) {
      console.error("PDF text extraction error:", error);
      setIsExtracting(false);
      alert("Could not read the text from this PDF.");
    }
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setSpokenText("");
      setMatchedPage(null);

      await extractPdfText(selectedFile);
    } else {
      alert("Please select a PDF file.");
    }
  };

  // Find the best matching PDF page
  const findQuestion = (spokenQuestion) => {
    if (!spokenQuestion || pageTexts.length === 0) {
      return;
    }

    const spokenNormalized = normalizeText(spokenQuestion);
    const spokenWords = getWords(spokenQuestion);

    let bestPage = null;
    let bestScore = 0;

    pageTexts.forEach((page) => {
      const pageNormalized = normalizeText(page.text);
      const pageWords = getWords(page.text);

      // Strong match if the complete spoken sentence exists on the page
      if (
        spokenNormalized.length > 5 &&
        pageNormalized.includes(spokenNormalized)
      ) {
        bestPage = page.pageNumber;
        bestScore = 100;
        return;
      }

      // Compare important words
      let matchingWords = 0;

      spokenWords.forEach((word) => {
        if (pageWords.includes(word)) {
          matchingWords++;
        }
      });

      if (spokenWords.length > 0) {
        const score = matchingWords / spokenWords.length;

        if (score > bestScore) {
          bestScore = score;
          bestPage = page.pageNumber;
        }
      }
    });

    if (bestPage && bestScore >= 0.3) {
      setMatchedPage(bestPage);

      setTimeout(() => {
        const element = pageRefs.current[bestPage - 1];

        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      }, 300);
    } else {
      setMatchedPage(null);
      alert("I couldn't find a matching question in the PDF.");
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported. Please use Google Chrome."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setSpokenText("");
      setMatchedPage(null);
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;

      setSpokenText(text);

      // Search PDF after speech is recognized
      findQuestion(text);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="app">
      <h1>📄 PDF Voice Search</h1>

      <p>Select your interview PDF</p>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
      />

      {isExtracting && (
        <div className="status-box">
          📖 Reading your PDF...
        </div>
      )}

      {pageTexts.length > 0 && !isExtracting && (
        <div className="ready-box">
          ✅ PDF is ready for voice search
        </div>
      )}

      <div className="voice-section">
        <button
          onClick={startListening}
          disabled={isListening || isExtracting || !file}
        >
          {isListening ? "🎤 Listening..." : "🎤 Speak Question"}
        </button>
      </div>

      {spokenText && (
        <div className="spoken-text">
          <strong>You said:</strong>
          <p>{spokenText}</p>
        </div>
      )}

      {matchedPage && (
        <div className="match-box">
          ✅ Question Found
          <br />
          <strong>Page {matchedPage}</strong>
        </div>
      )}

      {file && (
        <div className="pdf-container">
          <h2>{file.name}</h2>

          <Document
            file={file}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={(error) =>
              console.error("PDF Display Error:", error)
            }
          >
            {Array.from(new Array(numPages || 0), (_, index) => (
              <div
                key={`page_container_${index + 1}`}
                ref={(element) => {
                  pageRefs.current[index] = element;
                }}
                className={
                  matchedPage === index + 1
                    ? "pdf-page matched-page"
                    : "pdf-page"
                }
              >
                <div className="page-number">
                  Page {index + 1}
                </div>

                <Page
                  pageNumber={index + 1}
                  width={700}
                />
              </div>
            ))}
          </Document>
        </div>
      )}
    </div>
  );
}

export default App;