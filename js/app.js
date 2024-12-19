function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('show');
}

// Close menu when clicking on a link (mobile)
document.querySelectorAll('#sidebar a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('show');
        }
    });
});

// Close menu when clicking outside (mobile)
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const menuButton = document.querySelector('.menu-button');
    
    if (window.innerWidth <= 768 && 
        !sidebar.contains(e.target) && 
        !menuButton.contains(e.target)) {
        sidebar.classList.remove('show');
    }
});

document.getElementById('appointmentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.querySelector('input[type="text"]').value;
    const whatsapp = document.querySelector('input[type="tel"]').value;
    const email = document.querySelector('input[type="email"]').value;
    const service = document.querySelector('select').value;
    const serviceText = document.querySelector('select option:checked').text;
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('timeSlots').value;
    
    const appointmentData = {
        name,
        whatsapp,
        email,
        service,
        serviceText,
        date,
        time,
        formattedDate: new Date(date).toLocaleDateString('pt-BR')
    };

    saveAppointmentToStorage(appointmentData);

    const formattedDate = new Date(date).toLocaleDateString('pt-BR');
    
    const clientMessage = `
*Agendamento Confirmado!*

Olá ${name},

Seu agendamento foi confirmado com sucesso!

*Detalhes do agendamento:*
- Serviço: ${serviceText}
- Data: ${formattedDate}
- Horário: ${time}

*Local:*
Wood Barbearia
Rua Pinto Alves, 396 - Vila Santa Cecília
Lagoa Santa/MG - CEP: 33230-222

Em caso de dúvidas, entre em contato:
Telefone: (31) 99298-4248

Agradecemos a preferência!`;
    
    const ownerMessage = `
*Novo Agendamento!*

*Detalhes do cliente:*
Nome: ${name}
WhatsApp: ${whatsapp}
Email: ${email}

*Serviço agendado:*
${serviceText}

Data: ${formattedDate}
Horário: ${time}`;

    const formattedClientPhone = whatsapp.replace(/\D/g, '');
    const clientPhoneWithCountryCode = `55${formattedClientPhone}`;
    const ownerPhone = '5531992984248';

    const clientWhatsAppLink = `https://wa.me/${clientPhoneWithCountryCode}?text=${encodeURIComponent(clientMessage)}`;
    const ownerWhatsAppLink = `https://wa.me/${ownerPhone}?text=${encodeURIComponent(ownerMessage)}`;

    window.open(clientWhatsAppLink, '_blank');
    window.open(ownerWhatsAppLink, '_blank');

    alert('Agendamento realizado com sucesso! As mensagens de confirmação serão enviadas via WhatsApp.');
    
    e.target.reset();
});

// Função para gerar horários disponíveis
function generateTimeSlots() {
    const timeSelect = document.getElementById('timeSlots');
    timeSelect.innerHTML = '<option value="">Selecione um horário</option>';
    
    const dateInput = document.getElementById('appointmentDate');
    const selectedDate = new Date(dateInput.value);
    const dayOfWeek = selectedDate.getUTCDay();

    if (dayOfWeek === 0 || dayOfWeek === 1) {
        timeSelect.innerHTML = '<option value="">Não atendemos aos domingos e segundas-feiras</option>';
        return;
    }

    const isSaturday = dayOfWeek === 6;
    const startTime = isSaturday ? 9 : 10;
    const endTime = isSaturday ? 18 : 20;

    for (let hour = startTime; hour < endTime; hour++) {
        for (let minute of ['00', '40']) {
            const time = `${hour.toString().padStart(2, '0')}:${minute}`;
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            timeSelect.appendChild(option);
        }
    }
}

// Adicionar event listener para a data
document.getElementById('appointmentDate').addEventListener('change', generateTimeSlots);

// Inicializar os horários quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    generateTimeSlots();
});

function saveAppointmentToStorage(appointmentData) {
    let appointments = JSON.parse(localStorage.getItem('woodBarbeariaAppointments') || '[]');
    
    appointments.push({
        ...appointmentData,
        id: Date.now(),
        createdAt: new Date().toISOString()
    });
    
    appointments.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateA - dateB;
    });
    
    localStorage.setItem('woodBarbeariaAppointments', JSON.stringify(appointments));
}

function viewAppointments() {
    const appointments = JSON.parse(localStorage.getItem('woodBarbeariaAppointments') || '[]');
    
    let appointmentsHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" id="appointmentsModal">
            <div class="bg-woodDark p-4 sm:p-8 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <h2 class="text-xl sm:text-2xl font-bold text-woodGold mb-4">Agenda de Appointments</h2>
                <div class="space-y-4">
    `;
    
    if (appointments.length === 0) {
        appointmentsHTML += `<p class="text-center text-gray-400">Nenhum agendamento encontrado</p>`;
    } else {
        const groupedAppointments = appointments.reduce((groups, appointment) => {
            const date = appointment.formattedDate;
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(appointment);
            return groups;
        }, {});
        
        for (const [date, dateAppointments] of Object.entries(groupedAppointments)) {
            appointmentsHTML += `
                <div class="border border-woodGold rounded-lg p-4 mb-4">
                    <h3 class="text-xl font-bold text-woodGold mb-2">${date}</h3>
                    <div class="space-y-2">
            `;
            
            dateAppointments.forEach(appointment => {
                appointmentsHTML += `
                    <div class="border-b border-gray-700 pb-2">
                        <p class="font-bold">${appointment.time} - ${appointment.name}</p>
                        <p class="text-sm text-gray-400">Serviço: ${appointment.serviceText}</p>
                        <p class="text-sm text-gray-400">Contato: ${appointment.whatsapp}</p>
                    </div>
                `;
            });
            
            appointmentsHTML += `
                    </div>
                </div>
            `;
        }
    }
    
    appointmentsHTML += `
                </div>
                <button onclick="document.getElementById('appointmentsModal').remove()" 
                        class="mt-4 bg-woodGold text-black px-4 py-2 rounded hover:bg-yellow-600 transition">
                    Fechar
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', appointmentsHTML);
}

function closeAppointmentsModal() {
    const modal = document.getElementById('appointmentsModal');
    if (modal) {
        modal.remove();
    }
}

const today = new Date().toISOString().split('T')[0];
document.getElementById('appointmentDate').min = today;

function showPasswordModal() {
    const modalHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" id="passwordModal">
            <div class="bg-white p-4 rounded-lg w-full max-w-md">
                <h2 class="text-xl font-bold mb-4">Digite a Senha</h2>
                <input type="password" id="passwordInput" class="border p-2 w-full mb-4" placeholder="Senha">
                <button id="submitPassword" class="bg-blue-500 text-white px-4 py-2 rounded">Ver Agenda Appointments</button>
                <button onclick="document.getElementById('passwordModal').remove()" class="mt-4 bg-red-500 text-white px-4 py-2 rounded">Fechar</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Adicionar evento para o botão de submit
    document.getElementById('submitPassword').addEventListener('click', () => {
        const password = document.getElementById('passwordInput').value;
        // Verifique a senha aqui
        if (password === 'suaSenhaCorreta') {
            viewAppointments(); // Chama a função para ver os agendamentos
            document.getElementById('passwordModal').remove(); // Fecha o modal
        } else {
            alert('Senha incorreta!');
        }
    });
}
