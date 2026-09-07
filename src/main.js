console.log("Too Much Income List - Torn API test v1");

const SUPABASE_URL = "https://dsknucquniwmaogpbyax.supabase.co";
const SUPABASE_KEY = "sb_publishable_CxUR4WE-nJtN5JstJNeF-Q_PSShAYto";

async function testTornApi(apiKey) {
    const response = await fetch(
        `https://api.torn.com/v2/user/?selections=profile&key=${encodeURIComponent(apiKey)}`
    );

    const data = await response.json();

    if (!response.ok || data.error) {
        throw new Error(
            data.error?.error || `Torn API error: ${response.status}`
        );
    }

    return data;
}

async function getPlayerStatus(apiKey, playerId) {
    const response = await fetch(
        `https://api.torn.com/v2/user/${playerId}?selections=profile&key=${encodeURIComponent(apiKey)}`
    );

    const data = await response.json();

    if (!response.ok || data.error) {
        throw new Error(
            data.error?.error || `Torn API error: ${response.status}`
        );
    }

    return data;
}

async function loadPlayers() {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/players?select=id,name,level,total,strength,defense,speed,dexterity&order=level.desc`,
        {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`
            }
        }
    );

    if (!response.ok) {
        throw new Error(`Supabase error: ${response.status}`);
    }

    return await response.json();
}
    function formatHospitalTime(until) {
        const remaining = Math.max(0, until - Math.floor(Date.now() / 1000));

        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;

        return `${minutes}m ${seconds}s`;
    }

    function startHospitalCountdown(players) {
        setInterval(() => {
            players.forEach((player) => {
                if (!player.hospitalUntil) {
                    return;
                }
    
                const statusCell = document.getElementById(
                    `status-${player.id}`
                );
    
                if (!statusCell) {
                    return;
                }
    
                const remaining = Math.max(
                    0,
                    player.hospitalUntil - Math.floor(Date.now() / 1000)
                );
    
                if (remaining <= 0) {
                    statusCell.textContent = "Hospital";
                    return;
                }
    
                statusCell.textContent = formatHospitalTime(
                    player.hospitalUntil
                );
            });
        }, 1000);
    }

async function renderPlayers(players) {
    const table = document.getElementById("data-table");
    const tableBody = document.getElementById("table-body");
    const noDataMessage = document.getElementById("no-data-message");

    tableBody.innerHTML = "";

    if (players.length === 0) {
        noDataMessage.classList.remove("hidden");
        table.classList.remove("hidden");
        return;
    }

    noDataMessage.classList.add("hidden");

    players.forEach((player) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-200 sm:pl-6">
                ${player.name}
            </td>

            <td class="hidden px-3 py-4 text-sm text-gray-500 dark:text-gray-400 lg:table-cell">
                ${player.level}
            </td>

            <td class="hidden px-3 py-4 text-sm text-gray-500 dark:text-gray-400 lg:table-cell">
                ${player.total}
            </td>

            <td class="hidden px-3 py-4 text-sm text-gray-500 dark:text-gray-400 lg:table-cell">
                ${player.strength}
            </td>

            <td class="hidden px-3 py-4 text-sm text-gray-500 dark:text-gray-400 lg:table-cell">
                ${player.defense}
            </td>

            <td class="hidden px-3 py-4 text-sm text-gray-500 dark:text-gray-400 lg:table-cell">
                ${player.speed}
            </td>

            <td class="hidden px-3 py-4 text-sm text-gray-500 dark:text-gray-400 lg:table-cell">
                ${player.dexterity}
            </td>

            <td class="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                ${player.status || "Unknown"}
            </td>

            <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <a
                    href="https://www.torn.com/profiles.php?XID=${player.id}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-600 hover:text-blue-500"
                >
                    Attack
                </a>
            </td>
        `;

        tableBody.appendChild(row);
    });

    table.classList.remove("hidden");
}

const apiKeyInput = document.getElementById("api-key");
const fetchButton = document.getElementById("fetch-button");

fetchButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
        console.log("Torn API key is missing");
        return;
    }

    console.log("Testing Torn API...");

    try {
        const data = await testTornApi(apiKey);

        console.log("Torn API works:", data);

        const players = await loadPlayers();

        console.log("Players loaded:", players);

        for (const player of players) {
            try {
                console.log("Checking player:", player);

                const status = await getPlayerStatus(apiKey, player.id);

                const playerStatus = status.profile?.status;

                if (playerStatus?.state === "Hospital" && playerStatus.until) {
                    player.status = formatHospitalTime(playerStatus.until);
                } else {
                    player.status = playerStatus?.description || "Unknown";
                }

                console.log("Player status:", status);
            } catch (error) {
                console.error(
                    `Failed to get status for ${player.name}:`,
                    error
                );

                player.status = "Error";
            }
        }

        await renderPlayers(players);

    } catch (error) {
        console.error("Torn API failed:", error);
    }
});
