document.addEventListener('DOMContentLoaded', function() {
  const calendar = document.getElementById('calendar');
  const today = new Date();
  const users = {
    'jz': 'jz',
    'mr': 'mr',
    'tg': 'tg'
  };
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']; // Start with Monday
  let events = [];

  function getNextThreeMonths() {
    let months = [];
    for (let i = 0; i < 3; i++) {
      const month = new Date(today.getFullYear(), today.getMonth() + i, 1);
      months.push(month);
    }
    return months;
  }

  function fetchEvents() {
    return $.get('save_day_color.php', function(data) {
      events = JSON.parse(data);
    });
  }

  function renderCalendar() {
    const months = getNextThreeMonths();
    months.forEach(month => {
      const monthContainer = document.createElement('div');
      monthContainer.classList.add('mb-4');
      const monthName = month.toLocaleString('default', { month: 'long', year: 'numeric' });
      const monthHeader = document.createElement('h3');
      monthHeader.textContent = monthName;
      monthContainer.appendChild(monthHeader);

      const monthGrid = document.createElement('div');
      monthGrid.classList.add('calendar-container');

      const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

      // Adjust start day of the month based on the first day of the month
      const firstDayOfWeek = new Date(month.getFullYear(), month.getMonth(), 1).getDay(); // 0 (Sunday) to 6 (Saturday)
      const startDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Adjust to start from Monday (0-indexed)

      for (let i = 0; i < startDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('calendar-day', 'empty');
        monthGrid.appendChild(emptyCell);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(month.getFullYear(), month.getMonth(), day);
        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-day');
        if (dayDate.getDay() === 0 || dayDate.getDay() === 6) {
          dayCell.classList.add('weekend');
        }
        dayCell.textContent = day;

        const dayEvents = events.filter(event => event.year == month.getFullYear() && event.month == month.getMonth() + 1 && event.day == day);
        dayEvents.forEach(event => {
          const userClass = event.user_class;
          const userSpan = document.createElement('span');
          userSpan.classList.add(userClass);
          userSpan.style.width = '100%';
          userSpan.style.height = '10px';
          userSpan.style.display = 'block';
          dayCell.appendChild(userSpan);
        });

        dayCell.addEventListener('click', function() {
          const user = prompt('Enter user (jz, mr, tg) or remove (-jz, -mr, -tg):');
          if (user.startsWith('-')) {
            const userClassToRemove = user.substring(1); // Remove the leading '-'
            const spanToRemove = dayCell.querySelector(`.${users[userClassToRemove]}`);
            if (spanToRemove) {
              spanToRemove.remove();
              removeDayColor(month.getFullYear(), month.getMonth() + 1, day, userClassToRemove);
            }
          } else if (users[user]) {
            const userSpan = document.createElement('span');
            userSpan.classList.add(users[user]);
            userSpan.style.width = '100%';
            userSpan.style.height = '20px';
            userSpan.style.display = 'block';
            dayCell.appendChild(userSpan);

            saveDayColor(month.getFullYear(), month.getMonth() + 1, day, users[user]);
          } else {
            alert('Invalid input!');
          }
        });

        monthGrid.appendChild(dayCell);
      }
      monthContainer.appendChild(monthGrid);
      calendar.appendChild(monthContainer);
    });
  }

  function saveDayColor(year, month, day, userClass) {
    $.post('save_day_color.php', {
      year: year,
      month: month,
      day: day,
      userClass: userClass
    }, function(response) {
      console.log(response);
    });
  }

  function removeDayColor(year, month, day, userClass) {
    $.post('save_day_color.php', {
      year: year,
      month: month,
      day: day,
      userClass: `-${userClass}` // Prefix with '-' to indicate removal
    }, function(response) {
      console.log(response);
    });
  }

  fetchEvents().then(renderCalendar);
});
