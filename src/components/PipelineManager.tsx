import React, { useEffect, useState } from "react";
import {
  TextField,
  Checkbox,
  PrimaryButton,
  DetailsList,
  IColumn,
  DetailsListLayoutMode,
  Dropdown,
  IDropdownOption,
  IconButton,
} from "@fluentui/react";
import { fetchPipelineRuns } from "../apiservice";
import "./PipelineManager.css"; // Add this for custom styling
import { FaArrowUp } from "react-icons/fa";

// Updated PipelineRun interface based on new API structure
interface PipelineRun {
  id: number;
  buildNumber: string;
  status: string; // The status of the pipeline run (e.g., "inProgress")
  startTime: string; // The start time of the pipeline run
  queueTime: string; // The queue time of the pipeline run
  sourceBranch: string; // The source branch
  definition: {
    id: number;
    name: string;
    url: string;
  };
  repository: {
    id: string;
    name: string;
    url: string;
  };
  requestedFor: {
    displayName: string;
    url: string;
  };
  logs: {
    url: string;
  };
  url: string; // The URL to access the pipeline run
  _links: {
    self: {
      href: string;
    };
    web: {
      href: string;
    };
  };
}
const PipelineManager: React.FC<{ definitionId: number }> = ({
  definitionId,
}) => {
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isAscending, setIsAscending] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    const getRuns = async () => {
      const data = await fetchPipelineRuns(definitionId);
      setRuns(data);
    };
    getRuns();
  }, [definitionId]);

  const handleStatusChange = (
    event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ) => {
    setSelectedStatus(option ? (option.key as string) : null);
  };

  const toggleSortOrder = () => {
    setIsAscending(!isAscending);
  };

  const filteredRuns = runs
    ?.filter(
      (run) =>
        run.buildNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedStatus ? run.status?.toLowerCase() === selectedStatus.toLowerCase() : true)
    )
    .sort((a, b) => {
      return isAscending
        ? a.buildNumber.localeCompare(b.buildNumber)
        : b.buildNumber.localeCompare(a.buildNumber);
    });

  const equalColumnWidth = 200;

  const columns: IColumn[] = [
    {
      key: "column1",
      name: "Select",
      fieldName: "id",
      minWidth: 50,
      maxWidth: 50,
      onRender: (item: PipelineRun) => (
        <Checkbox
          checked={selectedIds.includes(item.id)}
          onChange={(ev, checked) => {
            if (checked) {
              setSelectedIds([...selectedIds, item.id]);
            } else {
              setSelectedIds(selectedIds.filter((id) => id !== item.id));
            }
          }}
        />
      ),
    },
    {
      key: "column2",
      name: "Build Name",
      fieldName: "definition.name", // Updated to include Build Name
      minWidth: equalColumnWidth,
      maxWidth: equalColumnWidth,
      onRender: (item: PipelineRun) => (
        <span>{item.definition.name}</span> // Render the build name
      ),
    },
    {
      key: "column3",
      name: "Build Number",
      fieldName: "buildNumber",
      minWidth: equalColumnWidth,
      maxWidth: equalColumnWidth,
      onRenderHeader: () => (
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span>Build Number</span>
          <div onClick={toggleSortOrder}>
            <FaArrowUp />
          </div>
        </div>
      ),
    },
    {
      key: "column4",
      name: "Pipeline ID",
      fieldName: "id",
      minWidth: equalColumnWidth,
      maxWidth: equalColumnWidth,
    },
    {
      key: "column5",
      name: "Status",
      fieldName: "status",
      minWidth: equalColumnWidth,
      maxWidth: equalColumnWidth,
    },
    {
      key: "column6",
      name: "Queue Time",
      fieldName: "queueTime",
      minWidth: equalColumnWidth,
      maxWidth: equalColumnWidth,
    },
    {
      key: "column7",
      name: "Start Time",
      fieldName: "startTime",
      minWidth: equalColumnWidth,
      maxWidth: equalColumnWidth,
    },
    {
      key: "column8",
      name: "Link",
      fieldName: "_links.web.href",
      minWidth: equalColumnWidth,
      maxWidth: equalColumnWidth,
      onRender: (item: PipelineRun) => (
        <a href={item._links.web.href} target="_blank" rel="noopener noreferrer">
          View Pipeline
        </a>
      ),
    },
  ];
  

  const cancelSelected = () => {
    console.log("Canceling runs with IDs:", selectedIds);
  };

  const statusOptions: IDropdownOption[] = [
    { key: "inProgress", text: "In Progress" },
    { key: "completed", text: "Completed" },
  ];

  return (
    <div className="pipeline-container">
      <div className="search-container">
        <TextField
          label="Search by Build Number"
          value={searchTerm}
          onChange={(_, newValue) => setSearchTerm(newValue || "")}
          className="search-field"
        />
      </div>
      <div className="status-summary">
        <strong>In Progress: </strong>
        {runs.filter((run) => run.status === "inProgress").length}
        <strong> Completed: </strong>
        {runs.filter((run) => run.status === "completed").length}
        <strong> All: </strong>
        {runs.length}
      </div>
      <div className="button-container">
        <div className="sorting-dropdown">
          <Dropdown
            placeholder="Filter by Status"
            options={statusOptions}
            onChange={handleStatusChange}
            className="status-dropdown"
          />
        </div>
      </div>
      <DetailsList
        items={filteredRuns}
        columns={columns}
        setKey="set"
        layoutMode={DetailsListLayoutMode.fixedColumns}
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
