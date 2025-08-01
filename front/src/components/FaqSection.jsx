import React, { useState, useEffect, useRef } from 'react';
import '../styles/FaqSection.css'; 

const faqs = [
  {
    question: "Откуда берутся данные для прогноза на графике?",
    answer: "Прогноз строится на основе вашего последнего известного баланса, к которому добавляются все запланированные доходы и расходы, которые вы внесли в систему. Чем точнее и полнее вы укажете будущие операции (например, оплату аренды, зарплаты, ожидаемые поступления от клиентов), тем точнее будет прогноз."
  },
  {
    question: "Что такое \"кассовый разрыв\" и почему сервис обращает на него внимание?",
    answer: "Кассовый разрыв — это ситуация, когда на определённую дату в будущем прогнозируемая сумма расходов превышает сумму доступных средств (доходы плюс остаток на счёте). Сервис считает это критическим, так как нехватка оборотных средств может привести к невозможности оплатить обязательства и к упущенной выгоде."
  },
  {
    question: "Как рассчитываются \"потенциальные потери\" в блоке рекомендаций?",
    answer: "Для каждого способа покрыть дефицит сервис рассчитывает его стоимость. Например, для кредита — это сумма процентов, которые вы заплатите. Для досрочного снятия вклада — это упущенные проценты по нему. Для бездействия (изъятия из оборота) — это упущенная прибыль, которую вы могли бы получить, если бы эти деньги работали в бизнесе (рассчитывается на основе вашей маржинальности)."
  },
  {
    question: "Почему \"Изъятие оборотных средств\" — это тоже потери?",
    answer: "Когда вы забираете деньги из оборота для покрытия непредвиденных расходов, вы \"замораживаете\" часть своего бизнеса. Эти деньги перестают работать: на них нельзя закупить товар, оплатить рекламу или вложить в развитие. Потерянная из-за этого прибыль (упущенная выгода) и считается вашими потерями."
  },
  {
    question: "Являются ли рекомендации приказом к действию?",
    answer: "Нет, это лишь финансовый расчёт для поддержки вашего решения. Алгоритм ранжирует варианты по размеру прямых денежных потерь. Однако некоторые решения, например, отсрочка платежа поставщику, могут иметь нефинансовые последствия (например, ухудшение отношений). Наш сервис даёт вам объективные данные, а окончательное решение всегда остаётся за вами."
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