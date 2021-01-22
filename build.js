(async function () {
  const fs = require("fs");
  const glob = require("glob");
  const camelCase = require('camelcase');
  const Handlebars = require('handlebars');
  const md = require('markdown-it')({
    html: true,
    linkify: true
  });
  const axios = require('axios');
  const moment = require('moment');

  function registerPartialFromFile(name) {
    console.log('Registering Handlebars partial', name);
    const html = fs.readFileSync('templates/' + name + '.tpl.html', 'utf8');
    Handlebars.registerPartial(camelCase(name), html);
  }

  registerPartialFromFile('navbar-item');
  registerPartialFromFile('project-box');
  registerPartialFromFile('project');
  registerPartialFromFile('index');

  function compileTemplate(name) {
    console.log('Compiling template', name);
    const html = fs.readFileSync('templates/' + name + '.tpl.html', 'utf8');
    return Handlebars.compile(html);
  }

  const layoutTemplate = compileTemplate('layout');

  function renderMarkdown(markdownFile) {
    console.log('Rendering a Markdown ', markdownFile);
    const markdown = fs.readFileSync(markdownFile, 'utf8');
    return md.render(markdown);
  }

  function renderProjectTempate(templatePath, context) {
    console.log('Rendering the template', templatePath)
    context.whichPartial = () => 'project';
    fs.writeFileSync(templatePath.replace('README.md', 'index.html'), layoutTemplate(context));
  }

  function renderIndexTempate(context) {
    console.log('Rendering the welcome page template');
    context.whichPartial = () => 'index';
    fs.writeFileSync('index.html', layoutTemplate(context));
  }

  async function getGitHubProject(project) {
    console.log('Fetching metadata from GitHub for project', project);
    try {
      const response = await axios.get(`https://api.github.com/repos/evgeniy-khist/${project}`, { 
        headers: { Authorization: process.env.GITHUB_TOKEN } 
      });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  function formatDate(date) {
    return moment(date).format('D MMM YYYY');
  }

  function formatDateIso8601(date) {
    return moment(date).format('YYYY-MM-DD');
  }

  const projectNames = process.argv.slice(2);

  const projects = [];

  for (const projectName of projectNames) {
    console.log('Processing the project', projectName);
    const content = renderMarkdown(`${projectName}/README.md`);
    const title = content.match(/<h1.*>(.+)<\/h1>/i)[1];
    const gitHubProject = await getGitHubProject(projectName);
    const date = gitHubProject.pushed_at;

    const project = {
      project: projectName,
      title: title,
      description: gitHubProject.description,
      updatedAt: formatDate(date),
      updatedAtIso8601: formatDateIso8601(date),
      content: content
    };

    projects.push(project);
  }

  for (const project of projects) {
    console.log(`Rendering the project ${project.project} page`);
    renderProjectTempate(`${project.project}/README.md`, { title: project.title, project: project, projects: projects });

    glob(`${project.project}/**/README.md`, (err, files) => {
      if (err) {
        console.log('Error', err);
      } else {
        console.log(`Rendering project ${project.project} sub-pages`, files);
        for (const file of files) {
          console.log(`Rendering project ${project.project} sub-page`, file);
          const projectCopy = Object.assign({}, project);
          projectCopy.content = renderMarkdown(file);
          projectCopy.title = projectCopy.content.match(/<h1.*>(.+)<\/h1>/i)[1] || projectCopy.title;
          renderProjectTempate(file, { title: projectCopy.title, project: projectCopy, projects: projects });
        }
      }
    });
  }

  console.log('Rendering the welcome page');
  renderIndexTempate({
    title: 'evgeniy-khist.github.io',
    projects: projects
  });
})();