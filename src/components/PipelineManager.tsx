import React, { useEffect, useState } from 'react';
import { TextField, Checkbox, PrimaryButton, DetailsList, IColumn, DetailsListLayoutMode, Dropdown, IDropdownOption } from '@fluentui/react';
import { fetchPipelineRuns } from '../apiservice';
import './PipelineManager.css'; // Add this for custom styling

interface PipelineRun {
    id: number;
    name: string;
    status: string;
}

const PipelineManager: React.FC<{ definitionId: number }> = ({ definitionId }) => {
    const [runs, setRuns] = useState<PipelineRun[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isAscending, setIsAscending] = useState(true); // State for sorting by ID
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null); // State for selected status

    useEffect(() => {
        const getRuns = async () => {
            const data = await fetchPipelineRuns(definitionId);
            setRuns(data);
        };
        getRuns();
    }, [definitionId]);

    // Toggle sorting order between ascending and descending (for ID sorting)
    const toggleSortOrder = () => {
        setIsAscending(!isAscending);
    };

    // Handle status change from the dropdown
    const handleStatusChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
        setSelectedStatus(option ? option.key as string : null);
    };

    // Filtering runs based on search term and selected status
    const filteredRuns = runs
        ?.filter(run => 
            run.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedStatus ? run.status.toLowerCase() === selectedStatus.toLowerCase() : true)
        )
        .sort((a, b) => (isAscending ? a.id - b.id : b.id - a.id)); // Sort by ID

    const columns: IColumn[] = [
        {
            key: 'column1',
            name: 'Select',
            fieldName: 'id',
            minWidth: 50,
            maxWidth: 50,
            onRender: (item: PipelineRun) => (
                <Checkbox
                    checked={selectedIds.includes(item.id)}
                    onChange={(ev, checked) => {
                        if (checked) {
                            setSelectedIds([...selectedIds, item.id]);
                        } else {
                            setSelectedIds(selectedIds.filter(id => id !== item.id));
                        }
                    }}
                />
            )
        },
        { key: 'column2', name: 'ID', fieldName: 'id', minWidth: 100, maxWidth: 100, isMultiline: true },
        { key: 'column3', name: 'Name', fieldName: 'name', minWidth: 200, maxWidth: 200, isMultiline: true },
        { key: 'column4', name: 'Status', fieldName: 'status', minWidth: 100, maxWidth: 100, isMultiline: true },
    ];

    const cancelSelected = () => {
        console.log("Canceling runs with IDs:", selectedIds);
    };

    // Dropdown options for filtering by status
    const statusOptions: IDropdownOption[] = [
        { key: 'running', text: 'Running' },
        { key: 'queued', text: 'Queued' },
        { key: 'in build', text: 'In build' },
    ];

    return (
        <div className="pipeline-container">
            <div className="search-container">
                <TextField
                    label="Search by name"
                    value={searchTerm}
                    onChange={(_, newValue) => setSearchTerm(newValue || '')}
                    className="search-field"
                />
            </div>
            <div className="status-summary">
                <strong>Running: </strong>{runs.filter(run => run.status === 'running').length}
                <strong> Queued: </strong>{runs.filter(run => run.status === 'queued').length}
            </div>
            <div className='button-container'>
             <div className="sorting-dropdown">
                <Dropdown
                    placeholder="Filter by Status"
                    options={statusOptions}
                    onChange={handleStatusChange}
                    className="status-dropdown"
                />
             </div>
             <div className="sorting-buttons">
                <PrimaryButton
                    text={isAscending ? "Sort by ID Descending" : "Sort by ID Ascending"}
                    onClick={toggleSortOrder} // Toggle sorting by ID
                    className="sort-button"
                />
             </div>
            </div>
            <DetailsList
                items={filteredRuns}
                columns={columns}
                setKey="set"
                layoutMode={DetailsListLayoutMode.fixedColumns}
                onRenderRow={undefined}
                className="details-list"
            />
            <PrimaryButton
                text="Cancel Selected"
                onClick={cancelSelected}
                disabled={selectedIds.length === 0}
                className="cancel-button"
            />
        </div>
    );
};

export default PipelineManager;
