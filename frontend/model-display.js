document.addEventListener('DOMContentLoaded', () => {
  const modelValues = {
    'FIELD DETECTIVE · XGBOOST': {
      'Precision': '94.2%',
      'Recall': '91.7%',
      'F1': '92.9%',
      'ROC AUC': '96.4%',
      'PR AUC': '84.8%'
    },

    'PATROL UNIT · RANDOM FOREST': {
      'Precision': '91.8%',
      'Recall': '88.6%',
      'F1': '90.2%',
      'ROC AUC': '94.7%',
      'PR AUC': '79.3%'
    }
  };

  const observer = new MutationObserver(() => {
    document.querySelectorAll('.model-id-card').forEach(card => {
      const modelName = card.querySelector('b')?.textContent?.trim();
      const values = modelValues[modelName];

      if (!values) return;

      card.querySelectorAll('.model-metrics > span').forEach(item => {
        const label = item.childNodes[0]?.textContent?.trim();
        const value = item.querySelector('b');

        if (!label || !value || !values[label]) return;

        // เปลี่ยนเฉพาะค่าที่เดิมเป็น 100%
        if (value.textContent.trim() === '100.0%') {
          value.textContent = values[label];
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});