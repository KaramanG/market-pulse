import { useState } from 'react';
import '../styles/FaqSection.css';

const faqData = [
  {
    question: 'Что показано на графиках?',
    answer: 'Графики показывают количество транзакций, средний чек, выручку по клиентам. Данные отображаются по вашим транзакциям и по конкурентам.'
  },
  {
    question: 'По какому критерию формируется график с данными конкурентов?',
    answer: 'Здесь будет содержательный ответ о том, как формируются данные по конкурентам для анализа кассовых разрывов.'
  },
  {
    question: 'За какой период можно посмотреть данные?',
    answer: 'Данные по кассовым разрывам доступны для анализа за последние 12 месяцев.'
  },
  {
    question: 'Сервис показывает весь рынок или только его часть?',
    answer: 'Сервис анализирует обезличенные данные по релевантной группе конкурентов, чтобы обеспечить репрезентативную картину.'
  }
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section" aria-label="Частые вопросы">
      <h2 className="faq-title">Частые вопросы</h2>
      <div className="faq-list">
        {faqData.map((item, index) => (
          <div key={index} className="faq-item">
            <button
              className="faq-question"
              onClick={() => handleToggle(index)}
              aria-expanded={openIndex === index}
            >
              <span>{item.question}</span>
              <span className={`faq-arrow ${openIndex === index ? 'open' : ''}`}></span>
            </button>
            {openIndex === index && (
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FaqSection;