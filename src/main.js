const SUPABASE_URL = "https://dsknucquniwmaogpbyax.supabase.co";
const SUPABASE_KEY = "sb_publishable_CxUR4WE-nJtN5JstJNeF-Q_PSShAYto";

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

async function init() {
    try {
        const players = await loadPlayers();

        console.log("Players loaded:", players);

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
                    -
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

    } catch (error) {
        console.error("Failed to load players:", error);
    }
}

init();
