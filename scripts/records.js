async function loadRecords() {
    if(!currentToken) {
        showToast("Please login first", true);
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE}/Quantity/records`, {
            headers: buildReqHeaders()
        });
        if(res.ok) {
            const data = await res.json();
            const tbody = document.getElementById("recordsTbody");
            tbody.innerHTML = "";
            if(data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center py-2">No history records found.</td></tr>';
                return;
            }
            
            data.forEach((r, i) => {
                const tr = document.createElement("tr");
                const d = new Date(r.createdAt);
                
                let inputsStr = r.operand1 || '';
                if (r.operand2) inputsStr += ` and ${r.operand2}`;
                
                let resStr = r.hasError ? `Error: ${r.errorMessage}` : (r.result || '-');
                
                tr.innerHTML = `
                    <td>${i+1}</td>
                    <td><strong>${r.operation}</strong></td>
                    <td>${inputsStr}</td>
                    <td>${resStr}</td>
                    <td><small>${d.toLocaleString()}</small></td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch(err) {
        console.error(err);
    }
}
