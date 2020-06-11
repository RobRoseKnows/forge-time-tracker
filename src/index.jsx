import api from '@forge/api';
import ForgeUI, { render, Text, IssuePanel, Fragment, useProductContext, useState } from '@forge/ui';

const STORAGE_NAMESPACE = "io.robrose.timetracker"

const now = () => {
  return new Date().getTime();
}

const setUserStartTime = async (issueId, userId) => {
  const setRes = api.store
    .onJiraIssue(issueId)
    .set(`${STORAGE_NAMESPACE}/${userId}/start`, now());
    
  console.info(`Start time setten for ${userId} on ${issueId}`);
  return setRes;
}

const fetchUserStartTime = async (issueId, userId) => {
  const getRes = await api.store
    .onJiraIssue(issueId)
    .get(`${STORAGE_NAMESPACE}/${userId}/start`);
  
  console.info(`Start time gotten for ${userId} on ${issueId}`);
  return getRes;
};


const App = () => {
  return (
    <Fragment>
      <Text>Hello world!</Text>
    </Fragment>
  );
};

export const run = render(
  <IssuePanel>
    <App/>
  </IssuePanel>
);
