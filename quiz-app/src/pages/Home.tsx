import React, { useRef, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonRefresher,
  IonRefresherContent,
  IonItem,
  IonLabel,
  IonToggle,
} from '@ionic/react';

import './Home.css';

type Question = {
  category: string;
  question: string;
  options: string[];
  answerIndex: number;
};

// QUIZ QUESTIONS
const QUIZ_QUESTIONS: Question[] = [
  // ---- GENERAL KNOWLEDGE ----
  { category: 'general', question: 'Which planet is known as the Red Planet?', options: ['Earth', 'Mars', 'Jupiter', 'Venus'], answerIndex: 1 },
  { category: 'general', question: 'Which animal is known as the “Ship of the Desert”?', options: ['Horse', 'Camel', 'Elephant', 'Donkey'], answerIndex: 1 },
  { category: 'general', question: 'Which is the largest ocean on Earth?', options: ['Indian Ocean', 'Arctic Ocean', 'Pacific Ocean', 'Atlantic Ocean'], answerIndex: 2 },

  // ---- MOVIES ----
  { category: 'movies', question: 'In movies, who is known as the “King of Bollywood”?', options: ['Salman Khan', 'Akshay Kumar', 'Shah Rukh Khan', 'Aamir Khan'], answerIndex: 2 },
  { category: 'movies', question: 'Which category are the Oscars mainly associated with?', options: ['Sports', 'Music', 'Movies', 'Science'], answerIndex: 2 },
  { category: 'movies', question: 'Which language is primarily used in Bollywood films?', options: ['Tamil', 'Hindi', 'Telugu', 'English'], answerIndex: 1 },

  // ---- SCIENCE ----
  { category: 'science', question: 'Water boils at what temperature (at sea level)?', options: ['50°C', '75°C', '90°C', '100°C'], answerIndex: 3 },
  { category: 'science', question: 'What gas do plants take in for photosynthesis?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'], answerIndex: 1 },
  { category: 'science', question: 'Which part of the human body pumps blood?', options: ['Lungs', 'Stomach', 'Heart', 'Liver'], answerIndex: 2 },

  // ---- POLITICS ----
  { category: 'politics', question: 'Who is the head of the United States government?', options: ['Chief Justice', 'President', 'Speaker of the House', 'Secretary of State'], answerIndex: 1 },
  { category: 'politics', question: 'Which political system is used in the United States?', options: ['Monarchy', 'Dictatorship', 'Democracy', 'Communism'], answerIndex: 2 },
  { category: 'politics', question: 'Which organization is responsible for making federal laws in the U.S.?', options: ['The Cabinet', 'Supreme Court', 'Congress', 'Pentagon'], answerIndex: 2 },

  // ---- COMPUTER SCIENCE ----
  { category: 'computerscience', question: 'What does “CPU” stand for?', options: ['Central Processing Unit', 'Computer Power Utility', 'Central Peripheral Unit', 'Core Processing Utility'], answerIndex: 0 },
  { category: 'computerscience', question: 'Which programming language is known for its snake logo?', options: ['Java', 'C++', 'Python', 'Swift'], answerIndex: 2 },
  { category: 'computerscience', question: 'Which data structure uses FIFO (First In, First Out)?', options: ['Stack', 'Queue', 'Tree', 'Graph'], answerIndex: 1 },

  // ---- SPORTS ----
  { category: 'sports', question: 'How many players are there on the field for one soccer team?', options: ['9', '10', '11', '12'], answerIndex: 2 },
  { category: 'sports', question: 'Which sport is associated with the term “love” in scoring?', options: ['Cricket', 'Football', 'Tennis', 'Basketball'], answerIndex: 2 },
  { category: 'sports', question: 'Which country is famous for winning many Cricket World Cups?', options: ['India', 'Australia', 'England', 'South Africa'], answerIndex: 1 },
];

const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Sound toggle 
  const [soundOn, setSoundOn] = useState(true);

  // Web Audio 
  const audioCtxRef = useRef<AudioContext | null>(null);

  const ensureAudio = async () => {
    const AC = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AC();
    }
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }
  };

  const beep = async (durationMs: number, frequency: number) => {
    if (!soundOn) return;

    try {
      await ensureAudio();
      const ctx = audioCtxRef.current!;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = frequency;

      // Soft volume
      gain.gain.value = 0.05;

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      setTimeout(() => osc.stop(), durationMs);
    } catch {
      // If audio is blocked, app still works
    }
  };

  const startQuiz = async () => {
    // Prime audio on a user gesture 
    if (soundOn) {
      await ensureAudio();
      await beep(60, 500);
    }

    setHasStarted(true);
    setIsFinished(false);
    setScore(0);
    setCurrentQuestionIndex(0);
  };

  const filteredQuestions =
    selectedCategory && selectedCategory !== 'all'
      ? QUIZ_QUESTIONS.filter((q) => q.category === selectedCategory)
      : QUIZ_QUESTIONS;

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const totalQuestions = filteredQuestions.length;

  const handleAnswerClick = async (optionIndex: number) => {
    if (!currentQuestion) return;

    const isCorrect = optionIndex === currentQuestion.answerIndex;

    if (isCorrect) {
      await beep(120, 880); // short high beep
      setScore((prev) => prev + 1);
    } else {
      await beep(250, 220); // longer low beep
    }

    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < filteredQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
    } else {
      setHasStarted(false);
      setIsFinished(true);

      // finish = double beep
      await beep(120, 660);
      setTimeout(() => beep(120, 660), 180);
    }
  };

  const restartQuiz = async () => {
    await beep(80, 500);

    setSelectedCategory(undefined);
    setHasStarted(false);
    setIsFinished(false);
    setScore(0);
    setCurrentQuestionIndex(0);
  };

  const handleRefresh = (event: any) => {
    setTimeout(() => {
      window.location.reload();
      event.detail.complete();
    }, 500);
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>Quiz App</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="quiz-home">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingText="Pull to reload" />
        </IonRefresher>

        <div className="quiz-container">
          {/* 1) WELCOME */}
          {!hasStarted && !isFinished && (
            <IonCard className="quiz-card">
              <IonCardHeader>
                <IonCardSubtitle>Welcome</IonCardSubtitle>
                <IonCardTitle>Test Your Knowledge</IonCardTitle>
              </IonCardHeader>

              <IonCardContent>
                <p className="quiz-text">Choose a category and start a fun quiz!</p>

                {/* Sound toggle  */}
                <IonItem lines="none">
                  <IonLabel>Sound Feedback</IonLabel>
                  <IonToggle
                    checked={soundOn}
                    onIonChange={(e) => setSoundOn(e.detail.checked)}
                  />
                </IonItem>

                <div className="quiz-field" style={{ marginTop: 12 }}>
                  <label className="quiz-label">Category</label>
                  <IonSelect
                    placeholder="Select one"
                    interface="popover"
                    value={selectedCategory}
                    onIonChange={(e) => setSelectedCategory(e.detail.value)}
                  >
                    <IonSelectOption value="all">All Categories</IonSelectOption>
                    <IonSelectOption value="general">General Knowledge</IonSelectOption>
                    <IonSelectOption value="movies">Movies</IonSelectOption>
                    <IonSelectOption value="science">Science</IonSelectOption>
                    <IonSelectOption value="politics">Politics</IonSelectOption>
                    <IonSelectOption value="computerscience">Computer Science</IonSelectOption>
                    <IonSelectOption value="sports">Sports</IonSelectOption>
                  </IonSelect>
                </div>

                <IonButton expand="block" className="quiz-start-button" onClick={startQuiz}>
                  Start Quiz
                </IonButton>
              </IonCardContent>
            </IonCard>
          )}

          {/* 2) QUESTIONS */}
          {hasStarted && !isFinished && currentQuestion && (
            <IonCard className="quiz-card">
              <IonCardHeader>
                <IonCardSubtitle>
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </IonCardSubtitle>
                <IonCardTitle className="quiz-question-title">
                  {currentQuestion.question}
                </IonCardTitle>
              </IonCardHeader>

              <IonCardContent>
                <div className="quiz-options">
                  {currentQuestion.options.map((option, index) => (
                    <IonButton
                      key={index}
                      expand="block"
                      fill="outline"
                      className="quiz-option-button"
                      onClick={() => handleAnswerClick(index)}
                    >
                      {option}
                    </IonButton>
                  ))}
                </div>
              </IonCardContent>
            </IonCard>
          )}

          {/* 3) RESULT */}
          {isFinished && (
            <IonCard className="quiz-card">
              <IonCardHeader>
                <IonCardSubtitle>Quiz Finished</IonCardSubtitle>
                <IonCardTitle>Your Score</IonCardTitle>
              </IonCardHeader>

              <IonCardContent>
                <p className="quiz-text quiz-score-text">
                  You answered <strong>{score}</strong> out of
                  <strong> {totalQuestions}</strong> questions correctly.
                </p>

                <IonButton expand="block" className="quiz-start-button" onClick={restartQuiz}>
                  Restart Quiz
                </IonButton>
              </IonCardContent>
            </IonCard>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
