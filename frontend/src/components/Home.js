import React, { Component } from 'react';
import {Card, Elevation, H3, H4, H6, Button, MenuItem, Switch} from "@blueprintjs/core";
import {MultiSelect} from "@blueprintjs/select";
import { filterProject, highlightText } from './Project';
import ProjectItem from "./ProjectItem";

class Home extends Component {
    state = {
        refreshing: false,
        projects: [],
        selectedProjects: [],
        displayedProjects: [],
        project: null,
        filters: {
            completed: false,
            working: true,
            queued: true
        }
    };

    componentDidMount() {
        this.refreshProjects();
        document.evaluate("//input[@class='bp3-input-ghost']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.style.width = "200px";
    }

    refreshProjects() {
        this.setState({refreshing: true});

        // TODO: replace with API call
        setTimeout(() => {
            this.setState({
                refreshing: false,
                projects: [
                    {
                        id: 1,
                        status_date: new Date().toDateString(),
                        status: "completed",
                        title: "Completed Project",
                        description: "This is a test project. It is solely for testing purposes. A user should never see it.",
                        author: "Test User",
                        added_date: new Date().toDateString(),
                        edited_date: false
                    },
                    {
                        id: 2,
                        status_date: new Date().toDateString(),
                        status: "working",
                        title: "In Progress Project",
                        description: "This is a test project. It is solely for testing purposes. A user should never see it.",
                        author: "Test User",
                        added_date: new Date().toDateString(),
                        edited_date: false
                    },
                    {
                        id: 3,
                        status_date: new Date().toDateString(),
                        status: "queued",
                        title: "Queued Project",
                        description: "This is a test project. It is solely for testing purposes. A user should never see it.",
                        author: "Test User",
                        added_date: new Date().toDateString(),
                        edited_date: false
                    }
                ]
            });

        }, 1000);
    }

    deleteProject(id) {
        let projects = [];
        for (let p of this.state.projects) {
            if (p.id !== id) {
                projects.push(p);
            }
        }
        this.setState({projects: projects});
    }

    editProject(id, data) {
        let projects = this.state.projects.slice();
        for (let p in projects) {
            if (projects[p].id === id) {
                projects[p].title = data.title;
                projects[p].description = data.description;
                projects[p].edited_date = new Date().toDateString();
            }
        }
        this.setState({projects: projects});
    }

    handleFilterChange(filter) {
        switch (filter.target.name) {
            case "cb-completed":
                this.setState({filters: {...this.state.filters, completed: !this.state.filters.completed}});
                break;

            case "cb-working":
                this.setState({filters: {...this.state.filters, working: !this.state.filters.working}});
                break;

            case "cb-queued":
                this.setState({filters: {...this.state.filters, queued: !this.state.filters.queued}});
                break;

            default:
                break;
        }
    }

    renderTag = (project) => project.title;

    handleTagRemove(_tag, index) {
        this.setState({selectedProjects: this.state.selectedProjects.filter((_p, i) => i !== index)});
    }

    handleProjectSelect(project) {
        if (!this.isProjectSelected(project)) this.selectProject(project);
        else this.deselectProject(this.getSelectedProjectIndex(project));
    }

    handleClearTags() {
        this.setState({selectedProjects: []})
    }

    render() {
        const { isAuthenticated } = this.props.auth;
        const style = {
            heading_card: {
                margin: "10px"
            },
            item: {
                card: {
                    margin: "5px 10px",
                },
                info: {
                    boxShadow: "none"
                }
            }
        };
        const clearTags = this.state.selectedProjects.length > 0 ? <Button icon="cross" minimal={true} onClick={this.handleClearTags.bind(this)}/> : null;

        return (
            <div className="container">
                <Card elevation={Elevation.THREE} style={style.heading_card}>
                    <H3>Projects</H3>
                    <p>Below is a list of projects that I am either currently working on
                        or will be working on in the near future. It also includes already
                        completed projects with links to the source code and where they
                        are running (if they are). If you would like to submit an idea
                        for a project, please login. Below, you can search for and filter
                        any projects.</p>
                    <Button text="Refresh Projects" intent="primary" icon="refresh" className="bp3-small"
                            loading={this.state.refreshing} onClick={this.refreshProjects.bind(this)} />
                </Card>

                <Card elevation={Elevation.TWO} style={style.heading_card}>
                    <H4>Search</H4>
                    <MultiSelect
                        initialContent={undefined}
                        itemPredicate={filterProject}
                        itemRenderer={this.renderProject}
                        items={this.state.projects}
                        noResults={<MenuItem text={"No Results."} disabled={true}/>}
                        onItemSelect={this.handleProjectSelect.bind(this)}
                        popoverProps={{ minimal: true }}
                        resetOnSelect={true}
                        tagRenderer={this.renderTag}
                        tagInputProps={{ tagProps: {intent: "none", minimal: false}, onRemove: this.handleTagRemove.bind(this), rightElement: clearTags }}
                        selectedItems={this.state.selectedProjects}
                        placeholder="Select Projects..."
                    />
                    <br/><br/>
                    <H6>Filters:</H6>
                    <Switch name="cb-completed" inline={true} label="Completed" checked={this.state.filters.completed} onChange={this.handleFilterChange.bind(this)}/>
                    <Switch name="cb-working" inline={true} label="In Progress" checked={this.state.filters.working} onChange={this.handleFilterChange.bind(this)}/>
                    <Switch name="cb-queued" inline={true} label="Queued" checked={this.state.filters.queued} onChange={this.handleFilterChange.bind(this)}/>
                </Card>

                {this.state.projects.map((project, key) => <ProjectItem authenticated={isAuthenticated()} data={project}
                                                                        key={key} onDelete={this.deleteProject.bind(this)} onEdit={this.editProject.bind(this)}/>)}
            </div>
        );
    }

    renderProject = (project, { handleClick, modifiers, query }) => {
        if (!modifiers.matchesPredicate) {
            return null;
        }

        return (
            <MenuItem
                active={modifiers.active}
                icon={this.isProjectSelected(project) ? "tick" : "blank"}
                key={project.id}
                label={project.author}
                onClick={handleClick}
                text={highlightText(project.title, query)}
                shouldDismissPopover={false}
            />
        );
    };

    getSelectedProjectIndex = (project) => {return this.state.selectedProjects.indexOf(project)};

    isProjectSelected = (project) => {return this.getSelectedProjectIndex(project) !== -1};

    selectProject = (project) => {this.setState({selectedProjects: [...this.state.selectedProjects, project]})};

    deselectProject = (index) => {this.setState({selectedProjects: this.state.selectedProjects.filter((_p, i) => i !== index)})};

}

export default Home;
