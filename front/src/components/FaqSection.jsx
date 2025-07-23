import React, { useState, useEffect, useRef } from 'react';
import '../styles/FaqSection.css'; 

const faqs = [
  { question: "Что показано на графиках?", answer: "Графики показывают количество транзакций, средний чек, выручку по клиентам. Данные отображаются по дням." },
  { question: "По какому критерию формируется график с данными конкурентов?", answer: "Данные конкурентов формируются на основе обезличенной и агрегированной статистики по схожим видам деятельности в вашем регионе." },
  { question: "За какой период можно посмотреть данные?", answer: "Вы можете просматривать данные за последнюю неделю, месяц или выбрать конкретный период в календаре." },
  { question: "Сервис показывает весь рынок или только его часть?", answer: "Сервис анализирует репрезентативную выборку рынка, достаточную для построения точных прогнозов и анализа тенденций." },
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