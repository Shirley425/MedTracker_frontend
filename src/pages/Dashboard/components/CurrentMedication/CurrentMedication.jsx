import React, { useEffect, useState } from "react";
import "./CurrentMedication.css";
import {
  createMedicationRecord,
  sendMedicationSlackReminder,
  updateMedicationSlackNotifications,
  updateMySlackConnection,
} from "../../../../api";
import { useAuth } from "../../../../AuthContext";

const formatTakenAt = (value) => {
  if (!value) {
    return "No doses recorded yet";
  }

  return new Date(value).toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
};

function buildRecordSummary(recordItems) {
  return recordItems.reduce((acc, record) => {
    const medicationId = record.medication_id;

    if (!acc[medicationId]) {
      acc[medicationId] = {
        totalTaken: 0,
        lastTakenAt: null,
      };
    }

    acc[medicationId].totalTaken += 1;

    if (
      !acc[medicationId].lastTakenAt ||
      new Date(record.taken_at) > new Date(acc[medicationId].lastTakenAt)
    ) {
      acc[medicationId].lastTakenAt = record.taken_at;
    }

    return acc;
  }, {});
}

const CurrentMedication = ({
  currentUser,
  medications = [],
  medicationRecords = [],
  isLoading = false,
  loadError = "",
}) => {
  const { updateCurrentUser } = useAuth();
  const [recordSummary, setRecordSummary] = useState({});
  const [actionError, setActionError] = useState("");
  const [activeMedicationId, setActiveMedicationId] = useState(null);
  const [slackActionMedicationId, setSlackActionMedicationId] = useState(null);
  const [slackMemberId, setSlackMemberId] = useState("");
  const [slackMessage, setSlackMessage] = useState("");
  const [isSavingSlackConnection, setIsSavingSlackConnection] = useState(false);
  const [medicationItems, setMedicationItems] = useState(medications);

  useEffect(() => {
    setSlackMemberId(currentUser?.slack_member_id || "");
  }, [currentUser?.id, currentUser?.slack_member_id]);

  useEffect(() => {
    setMedicationItems(medications);
  }, [medications]);

  useEffect(() => {
    setRecordSummary(buildRecordSummary(medicationRecords));
  }, [medicationRecords]);

  const handleTakenClick = async (medicationId) => {
    setActiveMedicationId(medicationId);
    setActionError("");

    try {
      const record = await createMedicationRecord({
        medication_id: medicationId,
        source: "MANUAL",
      });

      setRecordSummary((current) => {
        const previous = current[medicationId] || {
          totalTaken: 0,
          lastTakenAt: null,
        };

        return {
          ...current,
          [medicationId]: {
            totalTaken: previous.totalTaken + 1,
            lastTakenAt: record.taken_at,
          },
        };
      });
    } catch (submitError) {
      setActionError(submitError.message || "Unable to record medication as taken.");
    } finally {
      setActiveMedicationId(null);
    }
  };

  const handleSlackConnectionSave = async () => {
    setIsSavingSlackConnection(true);
    setSlackMessage("");
    setActionError("");

    try {
      const updatedUser = await updateMySlackConnection(slackMemberId);
      updateCurrentUser(updatedUser);
      setSlackMessage("Slack App connected successfully.");
    } catch (saveError) {
      setActionError(saveError.message || "Unable to save Slack connection.");
    } finally {
      setIsSavingSlackConnection(false);
    }
  };

  const handleSlackToggle = async (medicationId, enabled) => {
    setSlackActionMedicationId(medicationId);
    setActionError("");

    try {
      const updatedMedication = await updateMedicationSlackNotifications(medicationId, enabled);
      setMedicationItems((current) =>
        current.map((medication) =>
          medication.id === medicationId ? updatedMedication : medication
        )
      );
    } catch (toggleError) {
      setActionError(toggleError.message || "Unable to update Slack notifications.");
    } finally {
      setSlackActionMedicationId(null);
    }
  };

  const handleSendSlackReminder = async (medicationId) => {
    setSlackActionMedicationId(medicationId);
    setSlackMessage("");
    setActionError("");

    try {
      await sendMedicationSlackReminder(medicationId);
      setSlackMessage("Slack reminder sent.");
    } catch (reminderError) {
      setActionError(reminderError.message || "Unable to send Slack reminder.");
    } finally {
      setSlackActionMedicationId(null);
    }
  };

  if (isLoading) {
    return <div className="current-medication-container">Loading medications...</div>;
  }

  if (loadError) {
    return <div className="current-medication-container">Error: {loadError}</div>;
  }

  return (
    <div className="current-medication-container">
      <div className="tracker-header">
        <h2>Current Medication Tracker</h2>
        <p className="tracker-summary">
          {medications.length} active medication{medications.length === 1 ? "" : "s"} in your tracker
        </p>
      </div>

      <div className="slack-connect-card">
        <h3>Slack App Connection</h3>
        <p>
          Link your Slack member ID so MedTracker can DM reminders and record Taken actions directly from Slack.
        </p>
        <div className="slack-connect-row">
          <input
            type="text"
            placeholder="Enter your Slack member ID, for example U01234567"
            value={slackMemberId}
            onChange={(event) => setSlackMemberId(event.target.value)}
          />
          <button
            type="button"
            className="slack-save-button"
            onClick={handleSlackConnectionSave}
            disabled={isSavingSlackConnection}
          >
            {isSavingSlackConnection ? "Saving..." : "Link Slack App"}
          </button>
        </div>
        <p className="slack-status">
          Slack connected: {currentUser?.slack_connected ? "Yes" : "No"}
        </p>
        {slackMessage && <p className="slack-message">{slackMessage}</p>}
      </div>

      {actionError && <p className="tracker-action-error">{actionError}</p>}

      {medicationItems.length === 0 ? (
        <p className="tracker-empty-state">No medications found in the backend yet.</p>
      ) : (
        <div className="medication-table-shell">
          <table className="medication-table">
            <thead>
              <tr>
                <th>Medication Name</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Last Taken</th>
                <th>Taken Records</th>
                <th>Slack Notifications</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {medicationItems.map((med, index) => {
                const summary = recordSummary[med.id] || {
                  totalTaken: 0,
                  lastTakenAt: null,
                };

                const slackBusy = slackActionMedicationId === med.id;

                return (
                  <tr key={med.id ?? index}>
                    <td data-label="Medication Name">
                      <div className="medication-name-cell">
                        <strong>{med.name}</strong>
                      </div>
                    </td>
                    <td data-label="Dosage">{med.dosage || "-"}</td>
                    <td data-label="Frequency">{med.frequency || "-"}</td>
                    <td data-label="Start Date">{med.start_date || "-"}</td>
                    <td data-label="End Date">{med.end_date || "-"}</td>
                    <td data-label="Last Taken">{formatTakenAt(summary.lastTakenAt)}</td>
                    <td data-label="Taken Records">
                      <span className="taken-count-pill">{summary.totalTaken}</span>
                    </td>
                    <td data-label="Slack Notifications">
                      <label className="slack-toggle">
                        <input
                          type="checkbox"
                          checked={Boolean(med.slack_notifications_enabled)}
                          onChange={(event) => handleSlackToggle(med.id, event.target.checked)}
                          disabled={slackBusy}
                        />
                        <span className={med.slack_notifications_enabled ? "status-pill on" : "status-pill off"}>
                          {med.slack_notifications_enabled ? "On" : "Off"}
                        </span>
                      </label>
                      <button
                        type="button"
                        className="slack-reminder-button"
                        onClick={() => handleSendSlackReminder(med.id)}
                        disabled={
                          slackBusy ||
                          !currentUser?.slack_connected ||
                          !med.slack_notifications_enabled
                        }
                      >
                        {slackBusy ? "Working..." : "Send Reminder"}
                      </button>
                    </td>
                    <td data-label="Action">
                      <button
                        type="button"
                        className="taken-button"
                        onClick={() => handleTakenClick(med.id)}
                        disabled={activeMedicationId === med.id}
                      >
                        {activeMedicationId === med.id ? "Saving..." : "Taken"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CurrentMedication;
