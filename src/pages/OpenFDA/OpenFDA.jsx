import React, { useState } from "react";
import "./OpenFDA.css";

const OpenFDA = () => {
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setError("");
    setData(null);

    const url = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(query)}"&limit=1`;

    try {
      const res = await fetch(url);
      const json = await res.json();
      if (json.results && json.results.length > 0) {
        setData(json.results[0]);
      } else {
        setError("No results found.");
      }
    } catch (err) {
      setError("Error fetching data.");
    }
  };

  return (
    <div className="openfda-container">
      <h2>Medication Info Lookup</h2>
      <h3>Powered by OpenFDA</h3>
      <input
        type="text"
        placeholder="Enter generic name or NDC"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      {error && <p className="error">{error}</p>}

      {data && (
        <div className="result">
          {data.indications_and_usage && (
            <>
              <h3>Indications / Usage</h3>
              {data.indications_and_usage.map((item, idx) => (
                <p key={idx}>{item}</p>
              ))}
            </>
          )}

          {data.adverse_reactions && (
            <>
              <h3>Possible Adverse Reactions</h3>
              {data.adverse_reactions.map((item, idx) => (
                <p key={idx}>{item}</p>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default OpenFDA;
