import api from '@forge/api';
import ForgeUI, { render, Text, IssuePanel, Fragment, useProductContext, useState, useAction } from '@forge/ui';

const STORAGE_NAMESPACE = "io.robrose.timetracker"

const now = () => {
  return new Date().getTime();
}

const msToHMS = (ms) => {
  // 1- Convert to seconds:
  var seconds = ms / 1000;
  // 2- Extract hours:
  var hours = parseInt( seconds / 3600 ); // 3,600 seconds in 1 hour
  seconds = seconds % 3600; // seconds remaining after extracting hours
  // 3- Extract minutes:
  var minutes = parseInt( seconds / 60 ); // 60 seconds in 1 minute
  // 4- Keep only seconds not extracted to minutes:
  seconds = seconds % 60;
  return `${hours}:${minutes}:${seconds}`
}

const setUserStartTime = async (issueKey, userId) => {
  const setRes = api.store
    .onJiraIssue(issueKey)
    .set(`${STORAGE_NAMESPACE}/${userId}/start`, now());

  console.info(`Start time async setten for ${userId} on ${issueKey}`);
  return setRes;
}

const fetchUserStartTime = async (issueKey, userId) => {
  const getRes = await api.store
    .onJiraIssue(issueKey)
    .get(`${STORAGE_NAMESPACE}/${userId}/start`);
  
  console.info(`Start time gotten for ${userId} on ${issueKey}`);
  return getRes;
};

const setUserEndTime = async (issueKey, userId) => {
  const setRes = api.store
    .onJiraIssue(issueKey)
    .set(`${STORAGE_NAMESPACE}/${userId}/end`, now());
  
  console.info(`End time async setten for ${userId} on ${issueKey}`);
  return setRes;
}

const fetchUserEndTime = async (issueKey, userId) => {
  const getRes = await api.store
    .onJiraIssue(issueKey)
    .get(`${STORAGE_NAMESPACE}/${userId}/end`);
  
  console.info(`End time gotten for ${userId} on ${issueKey}`);
  return getRes;
}

const fetchTotalTime = async (issueKey) => {
  const getRes = await api.store
    .onJiraIssue(issueKey)
    .get(`${STORAGE_NAMESPACE}/time`);
  
  console.info(`Total time gotten for ${issueKey}`);
  return getRes;
}

const fetchUserTime = async (issueKey, userId) => {
  const getRes = await api.store
    .onJiraIssue(issueKey)
    .get(`${STORAGE_NAMESPACE}/${userId}/time`);
  
  console.info(`Total time gotten for ${userId} on ${issueKey}`);
  return getRes;
}

const App = () => {
  const context = useProductContext();
  const issueKey = context.issueKey;
  const userId = context.accountId;
  
  const totTime = 0;
  const usrTime = 0;

  return (
    <Fragment>
      <Text>**Currently Logged Time Total:** {msToHMS(totTime)}</Text>
      <Text>**Your Currently Logged Time:** {msToHMS(usrTime)}</Text>
      <Button></Button>
    </Fragment>
  );
};

export const run = render(
  <IssuePanel>
    <App/>
  </IssuePanel>
);
