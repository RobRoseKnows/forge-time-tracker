import api from '@forge/api';
import ForgeUI, { render, Text, IssuePanel, Fragment, Button, ModalDialog, Table, Head, Row, Cell, Avatar, useProductContext, useState, useAction } from '@forge/ui';

const STORAGE_NAMESPACE = "io_robrose_timetracker"

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

const undefinedToZero = (val) => {
  if (val === undefined) {
    return 0;
  } else {
    return val;
  }
}

const setUserStartTime = async (issueKey, userId) => {
  const setRes = await api.store
    .onJiraIssue(issueKey)
    .set(`${STORAGE_NAMESPACE}_start_${userId}`, now());

  console.info(`Start time setten for ${userId} on ${issueKey}`);
  return setRes;
}

const fetchUserStartTime = async (issueKey, userId) => {
  const getRes = await api.store
    .onJiraIssue(issueKey)
    .get(`${STORAGE_NAMESPACE}_start_${userId}`);
  
  console.info(`Start time gotten for ${userId} on ${issueKey}`);
  return getRes;
};

const clearUserStartTime = async (issueKey, userId) => {
  const delRes = await api.store
    .onJiraIssue(issueKey)
    .delete(`${STORAGE_NAMESPACE}_start_${userId}`);
  
  console.info(`Start time deleten for ${userId} on ${issueKey}`);
  return delRes;
}

const setUserEndTime = async (issueKey, userId) => {
  const setRes = await api.store
    .onJiraIssue(issueKey)
    .set(`${STORAGE_NAMESPACE}_end_${userId}`, now());
  
  console.info(`End time setten for ${userId} on ${issueKey}`);
  return setRes;
}

const fetchUserEndTime = async (issueKey, userId) => {
  const getRes = await api.store
    .onJiraIssue(issueKey)
    .get(`${STORAGE_NAMESPACE}_end_${userId}`);
  
  console.info(`End time gotten for ${userId} on ${issueKey}`);
  return getRes;
}

const clearUserEndTime = async (issueKey, userId) => {
  const delRes = await api.store
    .onJiraIssue(issueKey)
    .delete(`${STORAGE_NAMESPACE}_end_${userId}`);
  
  console.info(`End time deleten for ${userId} on ${issueKey}`);
  return delRes;
}

const fetchTotalTime = async (issueKey) => {
  const getRes = await api.store
    .onJiraIssue(issueKey)
    .get(`${STORAGE_NAMESPACE}_time`);

  if (getRes === undefined) {
    console.debug(`${STORAGE_NAMESPACE}_time was undefined on ${issueKey}, will fill zero.`);
    const setRes = await api.store
      .onJiraIssue(issueKey)
      .set(`${STORAGE_NAMESPACE}_time`, 0);
    return 0;
  } else {
    console.info(`Total time gotten on ${issueKey}`);
    return getRes;
  }  
}

const addTotalTime = async (issueKey, time) => {
  const currTime = await fetchTotalTime(issueKey);

  const setRes = await api.store
    .onJiraIssue(issueKey)
    .set(`${STORAGE_NAMESPACE}_time`, time + currTime);
  return setRes;
}

const fetchUserTime = async (issueKey, userId) => {
  const getRes = await api.store
    .onJiraIssue(issueKey)
    .get(`${STORAGE_NAMESPACE}_time_${userId}`);
  
  if (getRes === undefined) {
    console.debug(`${STORAGE_NAMESPACE}_time_${userId} was undefined on ${issueKey}, will fill zero.`);
    const setRes = await api.store
      .onJiraIssue(issueKey)
      .set(`${STORAGE_NAMESPACE}_time_${userId}`, 0);
    return 0;
  } else {
    console.info(`Total time gotten for ${userId} on ${issueKey}`);
    return getRes;
  }
}

const addUserTime = async (issueKey, userId, time) => {
  const currTime = await fetchUserTime(issueKey, userId);

  const setRes = await api.store
    .onJiraIssue(issueKey)
    .set(`${STORAGE_NAMESPACE}_time_${userId}`, time + currTime);
  return setRes;
}

const fetchUsers = async (issueKey) => {
  const getRes = await api.store
    .onJiraIssue(issueKey)
    .get(`${STORAGE_NAMESPACE}_users`);

  console.info(`fetchUsers on ${issueKey}`);
  if (getRes === undefined) {
    console.debug(`${STORAGE_NAMESPACE}_users was undefined on ${issueKey}, will create blank array.`);
    const setRes = await api.store
      .onJiraIssue(issueKey)
      .set(`${STORAGE_NAMESPACE}_users`, []);
    return [];
  } else {
    return getRes;
  }  
}

const addUserToUsers = async (issueKey, userId) => {
  const getRes = fetchUsers(issueKey);
  if(getRes.includes(userId)) {
    console.info(`User ${userId} already in users key for ${issueKey}`);
    return false;
  } else {
    const setRes = await api.store
      .onJiraIssue(issueKey)
      .set(`${STORAGE_NAMESPACE}_users`, getRes.concat([userId]));
    console.info(`Added user ${userId} to users key for ${issueKey}`);
    return true;
  }
}

const getUserStatus = async (issueKey, userId) => {
  const inUsers = (await fetchUsers(issueKey)).includes(userId);
  if(!inUsers) {
    return "new";
  } else {
    const endTime = await fetchUserEndTime(issueKey, userId);
    if(endTime === undefined) {
      const startTime = await fetchUserStartTime(issueKey, userId);
      if(startTime === undefined) {
        return "returning";
      } else {
        return "working";
      }
    } else {
      // End time should never exist when a user clicks the button, but if it does, we're in some
      // sort of pending state.
      return "pending";
    }
  }
}

const App = () => {
  const context = useProductContext();
  const issueKey = context.issueKey;
  const userId = context.accountId;
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("Something went wrong.");
  const [totTime, updateTotTime] = useAction(
    async (currTime, step) => step ? currTime : undefinedToZero(await fetchTotalTime(issueKey)),
    0
  );
  const [usrTime, updateUsrTime] = useAction(
    async (currTime, step) => step ? currTime : undefinedToZero(await fetchUserTime(issueKey, userId)),
    0
  );
  const [buttonText, updateButtonText] = useAction(
    async (currText, step) => {
      if (step) {
        return currText;
      } else {
        switch(await getUserStatus(issueKey, userId)) {
          case "new":
            return "Start Time Tracking";
            break;
          case "pending":
            // This case should never exist, but just in case, we handle it separately.
            return "Resume Time Tracking";
            break;
          case "returning":
            return "Resume Time Tracking";
            break;
          case "working":
            return "Stop Time Tracking";
            break;
          default:
            return "Something Went Wrong";
            break;
        }
      }
    },
    "Start Time Tracking"
  );

  return (
    <Fragment>
      <Text>**Currently Logged Time Total:** {msToHMS(totTime)}</Text>
      <Text>**Your Currently Logged Time:** {msToHMS(usrTime)}</Text>
      <Button 
        text={buttonText}
        onClick={async () => {
          const status = getUserStatus(issueKey, userId);
          switch(status) {
            case "new":
              addUserToUsers(issueKey, userId);
              await setUserStartTime(issueKey, userId);
              break;
            case "pending":
            case "returning":
              await setUserStartTime(issueKey, userId);
              break;
            case "working":
              await setUserEndTime(issueKey, userId);
              break;
          }
          updateButtonText(false);
        }}
      />
      <Table>
        <Head>
          <Cell>
            <Text content="User" />
          </Cell>
          <Cell>
            <Text content="Time" />
          </Cell>
        </Head>
        {
          fetchUsers(issueKey).then(async (users) => 
            users.map(async (user) => (
              <Row>
                <Cell>
                  <Avatar accountId={user} />
                </Cell>
                <Cell>
                  <Text>{msToHMS(undefinedToZero(await fetchUserTime(issueKey, user)))}</Text>
                </Cell>
              </Row>
          )))
        }
      </Table>
      {isModalOpen && (
        <ModalDialog header="Time Tracker Error" onClose={() => setModalOpen(false)}>
          <Text>{modalText}</Text>
        </ModalDialog>
      )}
    </Fragment>
  );
};

export const run = render(
  <IssuePanel>
    <App/>
  </IssuePanel>
);
