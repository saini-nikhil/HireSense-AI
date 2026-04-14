export const resumeTemplate = (data: any) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${data.name} – Resume</title>
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
<body itemscope itemtype="https://schema.org/Person">

  <h1 itemprop="name">${data.name}</h1>
  <p class="subtitle" itemprop="jobTitle">${data.title}</p>
  <p class="contact">
    ${[data.email, data.phone, data.linkedin, data.github, data.location]
      .filter(Boolean)
      .join(' &nbsp;|&nbsp; ')}
  </p>

  <section>
    <h2>Summary</h2>
    <p>${data.summary}</p>
  </section>

  <section>
    <h2>Skills</h2>
    <p>${data.skills.join(', ')}</p>
  </section>

  <section>
    <h2>Work Experience</h2>
    ${data.experience
      .map(
        (exp: any) => `
      <article>
        <div class="job-header">
          <span class="job-title">${exp.role}</span>
          <span class="dates">${exp.duration ?? ''}</span>
        </div>
        <p class="company">${exp.company}${exp.location ? ` &nbsp;·&nbsp; ${exp.location}` : ''}</p>
        <ul>
          ${exp.points.map((p: string) => `<li>${p}</li>`).join('')}
        </ul>
      </article>
    `,
      )
      .join('')}
  </section>

  <section>
    <h2>Projects</h2>
    ${data.projects
      .map(
        (proj: any) => `
      <article>
        <p class="job-title">${proj.name}${proj.url ? ` &nbsp;–&nbsp; <span style="font-weight:normal">${proj.url}</span>` : ''}</p>
        <ul>
          ${proj.points.map((p: string) => `<li>${p}</li>`).join('')}
        </ul>
      </article>
    `,
      )
      .join('')}
  </section>

  <section>
    <h2>Education</h2>
    ${data.education
      .map(
        (edu: any) => `
      <article>
        <div class="job-header">
          <span class="job-title">${edu.degree} &nbsp;–&nbsp; ${edu.institution}</span>
          <span class="dates">${edu.duration}</span>
        </div>
        ${edu.location ? `<p class="company">${edu.location}</p>` : ''}
      </article>
    `,
      )
      .join('')}
  </section>

</body>
</html>
  `;
};
