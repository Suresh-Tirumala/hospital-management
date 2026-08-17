import React from 'react';

const prompts = {
  general: [
    "Explain the symptoms of diabetes",
    "What are the warning signs of a heart attack?",
    "How does blood pressure affect health?",
    "What causes migraines and how to manage them?",
    "Explain the stages of wound healing"
  ],
  rehabilitation: [
    "What's a good exercise routine for lower back pain?",
    "How to recover from a sprained ankle?",
    "Posture exercises for desk workers",
    "Knee replacement rehabilitation exercises",
    "Shoulder impingement treatment exercises"
  ],
  medications: [
    "Common side effects of antibiotics",
    "How to manage medication interactions",
    "What to know before taking blood pressure medication",
    "Safe use of over-the-counter pain relievers",
    "Understanding cholesterol medications"
  ],
  lifestyle: [
    "Benefits of regular exercise",
    "How to improve sleep quality",
    "Stress management techniques",
    "Healthy eating guidelines",
    "Benefits of meditation and mindfulness"
  ]
};

export default function SuggestedPrompts({ onSelect, category = 'general' }) {
  return (
    <div className="suggested-prompts">
      <h4>Try asking:</h4>
      <div className="prompts-grid">
        {prompts[category]?.map((prompt, index) => (
          <button
            key={index}
            className="prompt-chip"
            onClick={() => onSelect(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>
      <div className="prompt-categories">
        <button 
          className={`category-btn ${category === 'general' ? 'active' : ''}`}
          onClick={() => onSelect(prompts.general[Math.floor(Math.random() * prompts.general.length)])}
        >
          📚 General
        </button>
        <button 
          className={`category-btn ${category === 'rehabilitation' ? 'active' : ''}`}
          onClick={() => onSelect(prompts.rehabilitation[Math.floor(Math.random() * prompts.rehabilitation.length)])}
        >
          🦾 Rehab
        </button>
        <button 
          className={`category-btn ${category === 'medications' ? 'active' : ''}`}
          onClick={() => onSelect(prompts.medications[Math.floor(Math.random() * prompts.medications.length)])}
        >
          💊 Medications
        </button>
        <button 
          className={`category-btn ${category === 'lifestyle' ? 'active' : ''}`}
          onClick={() => onSelect(prompts.lifestyle[Math.floor(Math.random() * prompts.lifestyle.length)])}
        >
          🌿 Lifestyle
        </button>
      </div>
    </div>
  );
}