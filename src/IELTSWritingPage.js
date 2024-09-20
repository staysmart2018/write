import React, { useState, useEffect, useRef } from 'react';
import './IELTSWritingPage.css'; // Import the CSS file

const IELTSWritingPage = () => {
  const [currentPage, setCurrentPage] = useState('instructions'); // Manage current page state
  const [part1Answer, setPart1Answer] = useState('');
  const [part2Answer, setPart2Answer] = useState('');
  const [wordCount1, setWordCount1] = useState(0);
  const [wordCount2, setWordCount2] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60 * 60);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const totalQuestions = 2;

  // Separate refs for each text area
  const textAreaRef1 = useRef(null);
  const textAreaRef2 = useRef(null);

  const handleTextChange = (e) => {
    const text = e.target.value;

    if (currentQuestion === 1) {
      setPart1Answer(text);
      setWordCount1(text.split(/\s+/).filter((word) => word).length);
      adjustTextAreaHeight(textAreaRef1); // Adjust height for Part 1
    } else {
      setPart2Answer(text);
      setWordCount2(text.split(/\s+/).filter((word) => word).length);
      adjustTextAreaHeight(textAreaRef2); // Adjust height for Part 2
    }
  };

  // Function to adjust the height of the specified text area
  const adjustTextAreaHeight = (ref) => {
    if (ref.current) {
      // Save the current scroll position
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // Adjust the height of the textarea
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';

      // Restore the scroll position
      window.scrollTo(0, scrollTop);
    }
  };

  useEffect(() => {
    if (currentPage === 'writingTest') {
      const timer = setInterval(() => {
        setTimeRemaining((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);

      // Automatically submit the answers when time reaches 0
      const autoSubmitTimeout = setTimeout(() => {
        if (timeRemaining === 0) {
          handleSubmit();
        }
      }, timeRemaining * 1000); // Convert to milliseconds

      return () => {
        clearInterval(timer);
        clearTimeout(autoSubmitTimeout); // Clear the timeout on component unmount
      };
    }
  }, [timeRemaining, currentPage]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleQuestionChange = (direction) => {
    if (direction === 'next' && currentQuestion < totalQuestions) {
      setCurrentQuestion((prev) => prev + 1);
    } else if (direction === 'previous' && currentQuestion > 1) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    const answers = {
      part1: part1Answer,
      part2: part2Answer,
    };
    console.log('Submitting Answers:', answers);
    alert('Your answers have been submitted.');

    // Generate the text file after submission
    generateTextFile(answers);

    // Move to the completion page
    setCurrentPage('completed');
  };

  const generateTextFile = (answers) => {
    // Function to count words and repetitions
    const getWordCountAndRepetitions = (text) => {
      const words = text.toLowerCase().match(/\b\w+\b/g) || [];
      const wordCount = words.length;
      const wordFrequency = {};

      words.forEach((word) => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });

      const repeatedWords = Object.entries(wordFrequency)
        .filter(([word, count]) => count > 1)
        .map(([word, count]) => `${word}: ${count} times`)
        .join(', ');

      return { wordCount, repeatedWords };
    };

    // Get word count and repetitions for both answers
    const part1Stats = getWordCountAndRepetitions(answers.part1 || 'No answer provided.');
    const part2Stats = getWordCountAndRepetitions(answers.part2 || 'No answer provided.');

    // Generate the content for the text file
    const content = `IELTS Exam Simulator - User Answers\n\n` +
                    `Question 1:\n${answers.part1 || 'No answer provided.'}\n\n` +
                    '---------------------------------- \n'+
                    `Word Count for Question 1: ${part1Stats.wordCount}\n` +
                    `Repeated Words in Question 1: ${part1Stats.repeatedWords || 'None'}\n\n` +
                    '---------------------------------- \n'+
                    `Question 2:\n${answers.part2 || 'No answer provided.'}\n\n` +
                    '---------------------------------- \n'+
                    `Word Count for Question 2: ${part2Stats.wordCount}\n` +
                    `Repeated Words in Question 2: ${part2Stats.repeatedWords || 'None'}`;

    // Create a dynamic file name based on the current date and time
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now
      .getHours()
      .toString()
      .padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now
      .getSeconds()
      .toString()
      .padStart(2, '0')}`;

    const fileName = `IELTS_Writing_${timestamp}.txt`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  // Handle navigation to start the writing test
  const startTest = () => {
    setCurrentPage('writingTest');
  };

  // Render the appropriate page based on the current page state
  return (
    <div className="ielts-writing-page">
      {currentPage === 'instructions' && (
        <div className="instructions">
          <h1>IELTS Writing Test Instructions</h1>
          <p>This is the IELTS Writing test.</p>
          <p>
            Please note the following rules for the IELTS Writing test:
            <ul>
              <li>Read each question carefully before you start writing.</li>
              <li>Write at least 150 words for Task 1 and at least 250 words for Task 2.</li>
              <li>Organize your ideas logically and use clear language.</li>
            </ul>
          </p>
          <p>
            Take the questions by yourself; this platform provides only a service for exam simulation.
          </p>
          <button onClick={startTest}>Start Test</button>
        </div>
      )}

      {currentPage === 'writingTest' && (
        <>
          <div className="main-header">
            <h1>IELTS Exam Simulator</h1>
          </div>
          <div className="header">
            <div className="timer">
              <p>Time Remaining: {formatTime(timeRemaining)}</p>
            </div>
          </div>
          <div className="content">
            <div className="question-panel">
              <h2>Task {currentQuestion}</h2>
              <p>
                {currentQuestion === 1 ? (
                  <>
                    <div>
                      <p>
                        <strong>1)</strong> You are required to write 150 words or more.
                        <br />
                        If you write less than 150 words, you are unlikely to get more than a Band 5 for ‘task achievement’ as you won’t have fulfilled the marking criteria.
                      </p>
                      <p>
                        <strong>2)</strong> You have around 20 minutes to plan and write your essay.
                      </p>
                      <p>
                        <strong>3)</strong> You should use a formal style of writing.
                      </p>
                      <p>
                        <strong>4)</strong> Task 1 contributes half as many marks to your score as Task 2. So, Task 1 is worth 33% of the total mark in the Writing test.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    IELTS Writing Task 2 is the second part of the writing test, where you are presented with a point of view, argument or problem and asked to write an essay in response. Your essay should be in a formal style, at least 250 words in length and you should aim to complete it in under 40 minutes.
                  </>
                )}
              </p>
            </div>
            <div className="answer-panel">
              {currentQuestion === 1 ? (
                <textarea
                  ref={textAreaRef1}
                  value={part1Answer}
                  onChange={handleTextChange}
                  placeholder="Write your answer here..."
                  className="answer-textarea"
                  spellCheck="false" // Disable spellcheck
                  rows="10" // Default height of 10 lines
                />
              ) : (
                <textarea
                  ref={textAreaRef2}
                  value={part2Answer}
                  onChange={handleTextChange}
                  placeholder="Write your answer here..."
                  className="answer-textarea"
                  spellCheck="false" // Disable spellcheck
                  rows="10" // Default height of 10 lines
                />
              )}
              <p className="word-counter">
                {currentQuestion === 1 ? `Words: ${wordCount1}` : `Words: ${wordCount2}`}
              </p>
            </div>
          </div>
          <div className="footer">
            <div className="navigation">
              <button
                className="nav-button"
                onClick={() => handleQuestionChange('previous')}
                disabled={currentQuestion === 1}
              >
                &larr; Previous
              </button>
              <button
                className="nav-button"
                onClick={() => handleQuestionChange('next')}
                disabled={currentQuestion === totalQuestions}
              >
                Next &rarr;
              </button>
            </div>
            <div className="submit-button">
              <button onClick={handleSubmit}>Submit</button>
            </div>
          </div>
        </>
      )}

      {currentPage === 'completed' && (
        <div className="completion">
          <h1>Your IELTS Writing Test is Completed</h1>
          <p>You can now close this page.</p>
        </div>
      )}
    </div>
  );
};

export default IELTSWritingPage;

