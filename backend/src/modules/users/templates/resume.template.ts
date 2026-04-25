export const resumeTemplate = (data: any) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${data?.name ?? 'Resume'}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 13px;
      color: #000;
      margin: 0;
      padding: 32px 40px;
      line-height: 1.5;
    }
    h1 { font-size: 20px; font-weight: bold; margin: 0 0 2px; }
    h2 {
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      border-bottom: 1px solid #ccc;
      padding-bottom: 3px;
      margin: 20px 0 8px;
    }
    p { margin: 0 0 4px; }
    ul { margin: 4px 0 10px; padding-left: 18px; }
    li { margin-bottom: 3px; }
    .subtitle { font-size: 13px; color: #444; margin: 0 0 3px; }
    .contact { font-size: 12px; color: #555; margin: 0 0 20px; }
    .job-header { display: flex; justify-content: space-between; }
    .job-title { font-weight: bold; }
    .company { font-size: 12px; color: #555; margin-bottom: 4px; }
    .dates { font-size: 12px; color: #555; }
  </style>
</head>
<body>

 <h1>${data?.name ?? ''}</h1>
<p class="subtitle">${data?.title ?? ''}</p>

<p class="contact">
  ${data?.phone ? `📞 ${data.phone}` : ''}

  ${data?.email ? `
    &nbsp;|&nbsp; 📧 
    <a href="mailto:${data.email}" style="color:#000; text-decoration:none;">
      ${data.email}
    </a>
  ` : ''}

${data?.linkedin ? `
  &nbsp;|&nbsp; <svg width="12" height="12" viewBox="0 0 24 24" style="vertical-align:middle;">
  <path fill="#000" d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M8 17V10H5V17H8M6.5 8.5A1.5 1.5 0 1 0 6.5 5.5A1.5 1.5 0 0 0 6.5 8.5M19 17V13C19 10.8 17.2 9 15 9C13.8 9 12.7 9.6 12 10.5V10H9V17H12V13.5C12 12.7 12.7 12 13.5 12C14.3 12 15 12.7 15 13.5V17H19Z"/>
</svg>
  <a href="${data.linkedin}" target="_blank" rel="noopener noreferrer" style="color:#000; text-decoration:none;">
    ${
      data.linkedin.includes('/in/')
        ? data.linkedin.split('/in/')[1].replace(/\/$/, '')
        : data.linkedin
    }
  </a>
` : ''}

${data?.github ? `
  &nbsp;|&nbsp; 
  <svg width="12" height="12" viewBox="0 0 24 24" style="vertical-align:middle;">
    <path fill="#000" d="M12 0C5.37 0 0 5.37 0 12C0 17.3 3.438 21.8 8.205 23.385C8.805 23.495 9.025 23.145 9.025 22.845C9.025 22.575 9.015 21.735 9.01 20.635C5.672 21.365 4.968 19.045 4.968 19.045C4.422 17.665 3.633 17.295 3.633 17.295C2.546 16.545 3.717 16.56 3.717 16.56C4.922 16.645 5.555 17.8 5.555 17.8C6.64 19.62 8.422 19.08 9.105 18.765C9.215 17.99 9.535 17.46 9.885 17.16C7.145 16.86 4.265 15.78 4.265 10.965C4.265 9.615 4.735 8.515 5.535 7.645C5.415 7.345 5.005 6.095 5.645 4.445C5.645 4.445 6.645 4.135 8.995 5.705C9.955 5.435 10.975 5.3 12 5.295C13.025 5.3 14.045 5.435 15.005 5.705C17.355 4.135 18.355 4.445 18.355 4.445C18.995 6.095 18.585 7.345 18.465 7.645C19.265 8.515 19.735 9.615 19.735 10.965C19.735 15.795 16.85 16.855 14.105 17.155C14.565 17.545 14.965 18.305 14.965 19.465C14.965 21.135 14.95 22.515 14.95 22.845C14.95 23.145 15.17 23.5 15.78 23.385C20.565 21.8 24 17.3 24 12C24 5.37 18.63 0 12 0Z"/>
  </svg>
  <a 
    href="${data.github}" 
    onclick="window.open('${data.github}', '_blank')"
    style="color:#000; text-decoration:none;"
  >
    ${
      data.github.includes('github.com/')
        ? data.github.split('github.com/')[1].replace(/\/$/, '')
        : data.github
    }
  </a>
` : ''}

  ${data?.location ? `&nbsp;|&nbsp; 📍 ${data.location}` : ''}
</p>

  <section>
    <h2>Summary</h2>
    <p>${data?.summary ?? ''}</p>
  </section>

  <section>
    <h2>Skills</h2>
    <p>${(data?.skills ?? []).join(', ')}</p>
  </section>

  <section>
    <h2>Work Experience</h2>
    ${(data?.experience ?? [])
      .map(
        (exp: any) => `
      <article>
        <div class="job-header">
          <span class="job-title">${exp?.role ?? ''}</span>
          <span class="dates">${exp?.duration ?? ''}</span>
        </div>
        <p class="company">
          ${exp?.company ?? ''}
          ${exp?.location ? ` &nbsp;·&nbsp; ${exp.location}` : ''}
        </p>
        <ul>
          ${(exp?.points ?? [])
            .map((p: string) => `<li>${p}</li>`)
            .join('')}
        </ul>
      </article>
    `,
      )
      .join('')}
  </section>

  <section>
    <h2>Projects</h2>
    ${(data?.projects ?? [])
      .map(
        (proj: any) => `
      <article>
        <p class="job-title">
          ${proj?.name ?? ''}
          ${
            proj?.url
              ? ` &nbsp;–&nbsp; <span style="font-weight:normal">${proj.url}</span>`
              : ''
          }
        </p>
        <ul>
          ${(proj?.points ?? [])
            .map((p: string) => `<li>${p}</li>`)
            .join('')}
        </ul>
      </article>
    `,
      )
      .join('')}
  </section>

  <section>
    <h2>Education</h2>
    ${(data?.education ?? [])
      .map(
        (edu: any) => `
      <article>
        <div class="job-header">
          <span class="job-title">
            ${edu?.degree ?? ''} &nbsp;–&nbsp; ${edu?.institution ?? ''}
          </span>
          <span class="dates">${edu?.duration ?? ''}</span>
        </div>
        ${edu?.location ? `<p class="company">${edu.location}</p>` : ''}
      </article>
    `,
      )
      .join('')}
  </section>

</body>
</html>
  `;
};