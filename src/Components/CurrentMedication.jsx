import React, { useEffect, useState } from "react";
import "./CurrentMedication.css";
import {
  createMedicationRecord,
  getMedicationRecordsByUserId,
  getMedicationsByUserId,
  sendMedicationSlackReminder,
  updateMedicationSlackNotifications,
  updateUserSlackWebhook,
} from "../api";
import { useAuth } from "../AuthContext";

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

const CurrentMedication = ({ currentUser, userId = 1, refreshKey = 0 }) => {
  const { updateCurrentUser } = useAuth();
  const [medications, setMedications] = useState([]);
  const [recordSummary, setRecordSummary] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeMedicationId, setActiveMedicationId] = useState(null);
  const [slackActionMedicationId, setSlackActionMedicationId] = useState(null);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [slackMessage, setSlackMessage] = useState("");
  const [isSavingSlackWebhook, setIsSavingSlackWebhook] = useState(false);

  useEffect(() => {
    setSlackWebhookUrl("");
  }, [currentUser?.id]);

  useEffect(() => {
    let isMounted = true;

    async function loadTrackerData() {
      setIsLoading(true);
      setError("");

      try {
        const [medicationItems, recordItems] = await Promise.all([
          getMedicationsByUserId(userId),
          getMedicationRecordsByUserId(userId),
        ]);

        if (isMounted) {
          setMedications(medicationItems);
          setRecordSummary(
            recordItems.reduce((acc, record) => {
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
            }, {})
          );
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || "Unable to load medications.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTrackerData();

    return () => {
      isMounted = false;
    };
  }, [refreshKey, userId]);

  const handleTakenClick = async (medicationId) => {
    setActiveMedicationId(medicationId);
    setError("");

    try {
      const record = await createMedicationRecord({
        user_id: userId,
        medication_id: medicationId,
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
      setError(submitError.message || "Unable to record medication as taken.");
    } finally {
      setActiveMedicationId(null);
    }
  };

  const handleSlackWebhookSave = async () => {
    setIsSavingSlackWebhook(true);
    setSlackMessage("");
    setError("");

    try {
      const updatedUser = await updateUserSlackWebhook(userId, slackWebhookUrl);
      updateCurrentUser(updatedUser);
      setSlackWebhookUrl("");
      setSlackMessage("Slack connected successfully.");
    } catch (saveError) {
      setError(saveError.message || "Unable to save Slack webhook.");
    } finally {
      setIsSavingSlackWebhook(false);
    }
  };

  const handleSlackToggle = async (medicationId, enabled) => {
    setSlackActionMedicationId(medicationId);
    setError("");

    try {
      const updatedMedication = await updateMedicationSlackNotifications(medicationId, enabled);
      setMedications((current) =>
        current.map((medication) =>
          medication.id === medicationId ? updatedMedication : medication
        )
      );
    } catch (toggleError) {
      setError(toggleError.message || "Unable to update Slack notifications.");
    } finally {
      setSlackActionMedicationId(null);
    }
  };

  const handleSendSlackReminder = async (medicationId) => {
    setSlackActionMedicationId(medicationId);
    setSlackMessage("");
    setError("");

    try {
      await sendMedicationSlackReminder(medicationId);
      setSlackMessage("Slack reminder sent.");
    } catch (reminderError) {
      setError(reminderError.message || "Unable to send Slack reminder.");
    } finally {
      setSlackActionMedicationId(null);
    }
  };

  if (isLoading) {
    return <div className="current-medication-container">Loading medications...</div>;
  }

  if (error) {
    return <div className="current-medication-container">Error: {error}</div>;
  }

  return (
    <div className="current-medication-container">
      <h2>Current Medication Tracker</h2>

      <div className="slack-connect-card">
        <h3>Slack Reminder Connection</h3>
        <p>
          Connect a Slack incoming webhook once, then turn reminders on or off for each medication.
        </p>
        <div className="slack-connect-row">
          <input
            type="url"
            placeholder="Paste your Slack webhook URL"
            value={slackWebhookUrl}
            onChange={(event) => setSlackWebhookUrl(event.target.value)}
          />
          <button
            type="button"
            className="slack-save-button"
            onClick={handleSlackWebhookSave}
            disabled={isSavingSlackWebhook}
          >
            {isSavingSlackWebhook ? "Saving..." : "Connect Slack"}
          </button>
        </div>
        <p className="slack-status">
          Slack connected: {currentUser?.slack_connected ? "Yes" : "No"}
        </p>
        {slackMessage && <p className="slack-message">{slackMessage}</p>}
      </div>

      {medications.length === 0 ? (
        <p>No medications found in the backend yet.</p>
      ) : (
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
            {medications.map((med, index) => {
              const summary = recordSummary[med.id] || {
                totalTaken: 0,
                lastTakenAt: null,
              };

              const slackBusy = slackActionMedicationId === med.id;

              return (
                <tr key={med.id ?? index}>
                  <td>{med.name}</td>
                  <td>{med.dosage}</td>
                  <td>{med.frequency}</td>
                  <td>{med.start_date || "-"}</td>
                  <td>{med.end_date || "-"}</td>
                  <td>{formatTakenAt(summary.lastTakenAt)}</td>
                  <td>{summary.totalTaken}</td>
                  <td>
                    <label className="slack-toggle">
                      <input
                        type="checkbox"
                        checked={Boolean(med.slack_notifications_enabled)}
                        onChange={(event) => handleSlackToggle(med.id, event.target.checked)}
                        disabled={slackBusy}
                      />
                      <span>{med.slack_notifications_enabled ? "On" : "Off"}</span>
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
                  <td>
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
      )}
    </div>
  );
};

export default CurrentMedication;
