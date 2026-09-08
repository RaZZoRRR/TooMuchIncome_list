console.log("Too Much Income List - Torn API test v1");

const SUPABASE_URL = "https://dsknucquniwmaogpbyax.supabase.co";
const SUPABASE_KEY = "sb_publishable_CxUR4WE-nJtN5JstJNeF-Q_PSShAYto";
const ADD_PLAYER_URL = "https://dsknucquniwmaogpbyax.supabase.co/functions/v1/add-player";

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
        if (hospitalCountdownInterval) {
            clearInterval(hospitalCountdownInterval);
        }

    hospitalCountdownInterval = setInterval(() => {
            
            players.forEach((player) => {
                if (!player.hospitalUntil) {
                    return;
                }

                if (player.statusRefreshing) {
                    return;
                }
    
                const statusCell = document.getElementById(
                    `status-${player.id}`
                );

                console.log("Status cell:", statusCell);
    
                if (!statusCell) {
                    return;
                }
    
                const remaining = Math.max(
                    0,
                    player.hospitalUntil - Math.floor(Date.now() / 1000)
                );
    
                if (remaining <= 0) {
                    statusCell.textContent = "Checking...";
                    player.statusRefreshing = true;
                
                    getPlayerStatus(apiKeyInput.value.trim(), player.id)
                        .then((status) => {
                            player.statusRefreshing = false;
                            
                            const playerStatus = status.profile?.status;
                
                            if (playerStatus?.state === "Hospital" && playerStatus.until) {
                                player.hospitalUntil = playerStatus.until;
                                statusCell.textContent = formatHospitalTime(
                                    playerStatus.until
                                );
                            } else {
                                player.hospitalUntil = null;
                                statusCell.textContent =
                                    playerStatus?.description || "Unknown";
                            }
                        })
                        .catch((error) => {
                            player.statusRefreshing = false;
                            
                            console.error(
                                `Failed to refresh status for ${player.name}:`,
                                error
                            );
                
                            statusCell.textContent = "Error";
                        });
                
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

            <td
                id="status-${player.id}"
                class="px-3 py-4 text-sm text-gray-500 dark:text-gray-400"
            >
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

let hospitalCountdownInterval = null;

fetchButton.addEventListener("click", async (event) => {
    event.preventDefault();
    fetchButton.disabled = true;

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
            player.hospitalUntil = playerStatus.until;
            player.status = formatHospitalTime(playerStatus.until);
        } else {
            player.hospitalUntil = null;
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

        console.log("Starting hospital countdown");
        startHospitalCountdown(players);
    } catch (error) {
        console.error("Torn API failed:", error);
    }

    fetchButton.disabled = false;
});

//ADD PLAYER
const playerIdInput = document.getElementById("player-id");
const playerNameInput = document.getElementById("player-name");
const playerLevelInput = document.getElementById("player-level");
const playerTotalInput = document.getElementById("player-total");
const playerStrengthInput = document.getElementById("player-strength");
const playerDefenseInput = document.getElementById("player-defense");
const playerSpeedInput = document.getElementById("player-speed");
const playerDexterityInput = document.getElementById("player-dexterity");

const addPlayerButton = document.getElementById("add-player-button");
const addPlayerMessage = document.getElementById("add-player-message");

addPlayerButton.addEventListener("click", async () => {
    const player = {
        id: Number(playerIdInput.value),
        name: playerNameInput.value.trim(),
        level: Number(playerLevelInput.value),
        total: Number(playerTotalInput.value),
        strength: Number(playerStrengthInput.value),
        defense: Number(playerDefenseInput.value),
        speed: Number(playerSpeedInput.value),
        dexterity: Number(playerDexterityInput.value)
    };

    if (
        !player.id ||
        !player.name ||
        !player.level ||
        !player.total ||
        !player.strength ||
        !player.defense ||
        !player.speed ||
        !player.dexterity
    ) {
        addPlayerMessage.textContent = "Please fill in all fields.";
        return;
    }

    addPlayerButton.disabled = true;
    addPlayerMessage.textContent = "Adding player...";

    try {
        const response = await fetch(ADD_PLAYER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(player)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error || `Server error: ${response.status}`
            );
        }

        addPlayerMessage.textContent =
            `Player ${player.name} added successfully.`;

        console.log("Player added:", result);

        playerIdInput.value = "";
        playerNameInput.value = "";
        playerLevelInput.value = "";
        playerTotalInput.value = "";
        playerStrengthInput.value = "";
        playerDefenseInput.value = "";
        playerSpeedInput.value = "";
        playerDexterityInput.value = "";

    } catch (error) {
        console.error("Failed to add player:", error);

        addPlayerMessage.textContent =
            error.message || "Failed to add player.";
    }

    addPlayerButton.disabled = false;
});
