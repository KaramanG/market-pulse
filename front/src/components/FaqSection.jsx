import React, { useState, useEffect, useRef } from 'react';
import '../styles/FaqSection.css'; 

const faqs = [
  {
    question: "Откуда берутся данные для прогноза на графике?",
    answer: "На основе плановых доходов и расходов, которые вы вносите."
  },
  {
    question: "Что такое \"кассовый разрыв\"?",
    answer: "Прогнозная нехватка средств для покрытия будущих расходов."
  },
  {
    question: "Как рассчитываются \"потенциальные потери\"?",
    answer: "Оценивается стоимость каждого решения: проценты, упущенная выгода."
  },
  {
    question: "Почему \"Изъятие оборотных средств\" — это тоже потери?",
    answer: "Это упущенная прибыль, которую могли бы принести эти деньги."
  },
  {
    question: "Являются ли рекомендации приказом к действию?",
    answer: "Нет, это объективные данные для принятия вашего решения."
  }
];

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}


const FaqSection = () => {
  const [openIndexes, setOpenIndexes] = useState([]);
  const prevOpenIndexes = usePrevious(openIndexes) || [];
  
  const itemRefs = useRef([]);

  useEffect(() => {
    const newIndex = openIndexes.find(index => !prevOpenIndexes.includes(index));

    if (newIndex !== undefined) {
      const elementToScroll = itemRefs.current[newIndex];
      if (elementToScroll) {
        elementToScroll.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [openIndexes, prevOpenIndexes]);


  const handleToggle = (indexToToggle) => {
    const isOpen = openIndexes.includes(indexToToggle);
    if (isOpen) {
      setOpenIndexes(openIndexes.filter(i => i !== indexToToggle));
    } else {
      setOpenIndexes([...openIndexes, indexToToggle]);
    }
  };

  return (
    <section className="faq-section">
      <h2 className="faq-title">Частые вопросы</h2>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div 
            className="faq-item" 
            key={index}
            ref={el => itemRefs.current[index] = el}
          >
            <button
              type="button"
              className="faq-question"
              onClick={() => handleToggle(index)}
              aria-expanded={openIndexes.includes(index)}
            >
              {faq.question}
              <div className={`faq-arrow ${openIndexes.includes(index) ? 'open' : ''}`} />
            </button>
            
            <div className={`faq-answer-wrapper ${openIndexes.includes(index) ? 'open' : ''}`}>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FaqSection;