// Initialize the application
class ChecklistApp {
    constructor() {
        this.groups = this.loadFromLocalStorage();
        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Create new group button
        document.getElementById('createGroup').addEventListener('click', () => this.createGroup());
        
        // Allow Enter key to create group
        document.getElementById('groupName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.createGroup();
            }
        });
    }

    createGroup() {
        const groupNameInput = document.getElementById('groupName');
        const groupName = groupNameInput.value.trim();

        if (!groupName) {
            alert('Please enter a group name');
            return;
        }

        // Check if group already exists
        if (this.groups.some(g => g.name === groupName)) {
            alert('A group with this name already exists');
            return;
        }

        const newGroup = {
            id: Date.now(),
            name: groupName,
            items: []
        };

        this.groups.push(newGroup);
        this.saveToLocalStorage();
        this.render();
        groupNameInput.value = '';
        groupNameInput.focus();
    }

    addItem(groupId) {
        const input = document.getElementById(`item-input-${groupId}`);
        const itemText = input.value.trim();

        if (!itemText) {
            alert('Please enter an item');
            return;
        }

        const group = this.groups.find(g => g.id === groupId);
        if (group) {
            const newItem = {
                id: Date.now(),
                text: itemText,
                completed: false
            };
            group.items.push(newItem);
            this.saveToLocalStorage();
            this.render();
        }
    }

    toggleItem(groupId, itemId) {
        const group = this.groups.find(g => g.id === groupId);
        if (group) {
            const item = group.items.find(i => i.id === itemId);
            if (item) {
                item.completed = !item.completed;
                this.saveToLocalStorage();
                this.render();
            }
        }
    }

    deleteItem(groupId, itemId) {
        const group = this.groups.find(g => g.id === groupId);
        if (group) {
            group.items = group.items.filter(i => i.id !== itemId);
            this.saveToLocalStorage();
            this.render();
        }
    }

    deleteGroup(groupId) {
        if (confirm('Are you sure you want to delete this group and all its items?')) {
            this.groups = this.groups.filter(g => g.id !== groupId);
            this.saveToLocalStorage();
            this.render();
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('checklistGroups', JSON.stringify(this.groups));
    }

    loadFromLocalStorage() {
        const data = localStorage.getItem('checklistGroups');
        return data ? JSON.parse(data) : [];
    }

    render() {
        const container = document.getElementById('checklistContainer');

        if (this.groups.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>📝 No checklist groups yet</p>
                    <p>Create your first group to get started!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.groups.map(group => `
            <div class="checklist-group">
                <div class="group-header">
                    <h3>${this.escapeHtml(group.name)}</h3>
                    <div class="group-actions">
                        <button class="btn btn-danger" onclick="app.deleteGroup(${group.id})">Delete</button>
                    </div>
                </div>
                
                <div class="add-item-section">
                    <input 
                        type="text" 
                        id="item-input-${group.id}" 
                        placeholder="Add a new item..."
                        onkeypress="if(event.key === 'Enter') app.addItem(${group.id})"
                    />
                    <button class="btn btn-secondary" onclick="app.addItem(${group.id})">Add Item</button>
                </div>

                <ul class="checklist-items">
                    ${group.items.length === 0 ? 
                        '<li style="text-align: center; color: #999; padding: 20px;">No items yet. Add your first item above!</li>' :
                        group.items.map(item => `
                            <li class="checklist-item ${item.completed ? 'completed' : ''}">
                                <input 
                                    type="checkbox" 
                                    ${item.completed ? 'checked' : ''} 
                                    onchange="app.toggleItem(${group.id}, ${item.id})"
                                    id="item-${item.id}"
                                />
                                <label for="item-${item.id}">${this.escapeHtml(item.text)}</label>
                                <button class="delete-item" onclick="app.deleteItem(${group.id}, ${item.id})" title="Delete item">×</button>
                            </li>
                        `).join('')
                    }
                </ul>
            </div>
        `).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ChecklistApp();
});
