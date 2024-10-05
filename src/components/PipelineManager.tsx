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
  DetailsHeader,
  IDetailsHeaderProps,
  IRenderFunction,
} from "@fluentui/react";
import { fetchPipelineRuns } from "../apiservice";
import "./PipelineManager.css"; // Add this for custom styling
import { FaArrowUp } from "react-icons/fa";

interface PipelineRun {
  id: number;
  name: string;
  status?: string;
  url: string;
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
        run.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedStatus ? run.status?.toLowerCase() === selectedStatus.toLowerCase() : true)
    )
    .sort((a, b) => {
      return isAscending
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
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
      name: "Pipeline Name", // Keep name as a string
      fieldName: "name",
      minWidth: equalColumnWidth,
      maxWidth: equalColumnWidth,
      onRenderHeader: (props, defaultRender) => (
        <div style={{ display: "flex", alignItems: "center" , gap: "5px"}} >
          <span>Pipeline Name</span>
          <div onClick={toggleSortOrder}>
          <FaArrowUp />
          </div>
        </div>
      ),
    },
    {
      key: "column3",
      name: "Pipeline ID",
      fieldName: "id",
      minWidth: equalColumnWidth,
      maxWidth: equalColumnWidth,
    },
    {
      key: "column4",
      name: "Run ID",
      fieldName: "revision",
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
    { key: "running", text: "Running" },
    { key: "queued", text: "Queued" },
  ];

  return (
    <div className="pipeline-container">
      <div className="search-container">
        <TextField
          label="Search by name"
          value={searchTerm}
          onChange={(_, newValue) => setSearchTerm(newValue || "")}
          className="search-field"
        />
      </div>
      <div className="status-summary">
        <strong>Running: </strong>
        {runs.filter((run) => run.status === "running").length}
        <strong> Queued: </strong>
        {runs.filter((run) => run.status === "queued").length}
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
