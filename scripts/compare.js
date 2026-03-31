async function doCompare() {
    let val1 = document.getElementById("compVal1").value;
    let val2 = document.getElementById("compVal2").value;
    
    if(!val1 && !val2) return;
    if(!val1) val1 = "1";
    if(!val2) val2 = "1";

    const unit1 = document.getElementById("compUnit1").value;
    const unit2 = document.getElementById("compUnit2").value;

    const payload = {
        First: { Value: parseFloat(val1), Unit: unit1, MeasurementType: currentType },
        Second: { Value: parseFloat(val2), Unit: unit2, MeasurementType: currentType }
    };

    try {
        const res = await fetch(`${API_BASE}/Quantity/compare`, {
            method: "POST",
            headers: buildReqHeaders(),
            body: JSON.stringify(payload)
        });
        if(res.ok) {
            const isEq = await res.json();
            const textLabel = isEq ? "They are EQUAL" : "They are NOT EQUAL";
            document.getElementById("compResultText").innerHTML = isEq ? `<span style="color:var(--success)">${textLabel}</span>` : `<span style="color:var(--danger)">${textLabel}</span>`;
        } else {
             const errText = await res.text();
             document.getElementById("compResultText").innerHTML = `<span style="color:var(--danger)">Error: ${errText}</span>`;
        }
    } catch(err) {
        document.getElementById("compResultText").innerHTML = `<span style="color:var(--danger)">Connection Error</span>`;
    }
}


