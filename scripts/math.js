async function doMath() {
    let val1 = document.getElementById("mathVal1").value;
    let val2 = document.getElementById("mathVal2").value;
    
    if(!val1 && !val2) return; // if both empty, do nothing
    if(!val1) val1 = "1";
    if(!val2) val2 = "1";
    
    const unit1 = document.getElementById("mathUnit1").value;
    const unit2 = document.getElementById("mathUnit2").value;
    const op = document.getElementById("mathOp").value;

    const opIcons = { "add": "fa-plus", "subtract": "fa-minus", "divide": "fa-divide" };
    document.getElementById("mathIcon").className = `fa-solid ${opIcons[op]}`;

    const payload = {
        First: { Value: parseFloat(val1), Unit: unit1, MeasurementType: currentType },
        Second: { Value: parseFloat(val2), Unit: unit2, MeasurementType: currentType }
    };

    try {
        const res = await fetch(`${API_BASE}/Quantity/${op}`, {
            method: "POST",
            headers: buildReqHeaders(),
            body: JSON.stringify(payload)
        });
        if(res.ok) {
            if(op === "divide") {
                const ratio = await res.json();
                document.getElementById("mathResultText").innerHTML = `<span style="color:var(--success)">Result: ${ratio}</span>`;
            } else {
                const data = await res.json();
                const v = data.value !== undefined ? data.value : data.Value;
                const u = data.unit || data.Unit;
                document.getElementById("mathResultText").innerHTML = `<span style="color:var(--success)">Result: ${v} ${u}</span>`;
            }
        } else {
             const errText = await res.text();
             document.getElementById("mathResultText").innerHTML = `<span style="color:var(--danger)">Error: ${errText}</span>`;
        }
    } catch(err) {
         document.getElementById("mathResultText").innerHTML = `<span style="color:var(--danger)">Connection Error</span>`;
    }
}

