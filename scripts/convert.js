async function doConvert() {
    const val = document.getElementById("convValue").value;
    if(!val) return;
    
    const fromUnit = document.getElementById("convFromUnit").value;
    const toUnit = document.getElementById("convToUnit").value;
    
    const payload = {
        Source: { Value: parseFloat(val), Unit: fromUnit, MeasurementType: currentType },
        TargetUnit: toUnit
    };

    try {
        const res = await fetch(`${API_BASE}/Quantity/convert`, {
            method: "POST",
            headers: buildReqHeaders(),
            body: JSON.stringify(payload)
        });
        if(res.ok) {
            const data = await res.json();
            const valOut = data.value !== undefined ? data.value : data.Value;
            const unitOut = data.unit || data.Unit;
            document.getElementById("convResultText").innerHTML = `<span style="color:var(--success)">${val} ${fromUnit} = ${valOut} ${unitOut}</span>`;
        } else {
            const errText = await res.text();
            document.getElementById("convResultText").innerHTML = `<span style="color:var(--danger)">Error: ${errText}</span>`;
        }
    } catch(err) {
        document.getElementById("convResultText").innerHTML = `<span style="color:var(--danger)">Connection Error</span>`;
    }
}

