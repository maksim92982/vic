:root {
  font-family: 'Open Sans', sans-serif;
  color: #090821;
  background-color: #f8f8f9;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  background-color: #f8f8f9;
}
.page-wrapper {
  min-height: 100vh;
}
a {
  color: inherit;
  text-decoration: none;
}
.btn {
  padding: 0.8rem 1.6rem;
  border-radius: 999px;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}
.btn.primary {
  background: #c79d63;
  color: #fff;
}
.btn.ghost {
  background: transparent;
  border-color: #fff;
  color: #fff;
}
.section-header {
  text-align: center;
  max-width: 680px;
  margin: 0 auto 1.5rem;
}
.section-header h2 {
  font-family: 'Montserrat', sans-serif;
  font-size: 2rem;
}
.section-header p {
  color: #4a4a4a;
}

/* Все ссылки в подвале */
.site-footer a {
    color: #ffffff;
    text-decoration: none;
    transition: color 0.3s ease;
}

.site-footer a:hover {
    color: #c79d63; /* золотистый акцент */
}

/* Заголовки блоков в футере (Услуги, Контакты, Мы в соцсетях) */
.site-footer h4 {
    color: #ffffff;
    font-family: 'Montserrat', sans-serif;
    margin-bottom: 1rem;
}

/* Стили для списков в футере (убираем маркеры, отступы) */
.site-footer ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.site-footer ul li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
}

/* Для текстовых элементов без ссылок (например, адрес) */
.site-footer ul li:not(a) {
    color: #ffffff;
    opacity: 0.9;
}
