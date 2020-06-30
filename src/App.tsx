import React from "react"
import "./App.css"
import { observer } from "mobx-react-lite"
import { observable, action, autorun, computed, runInAction } from "mobx"

type Vegetable = {
    id: string
    kind: "vegetable" | "fruit"
    available_months: number[]
}

const cucmber: Vegetable = {
    id: "cucumber",
    kind: "vegetable",
    available_months: [1, 2, 3, 4, 5, 6, 7],
}

const banana: Vegetable = {
    id: "banana",
    kind: "fruit",
    available_months: [1, 2, 3, 4, 5, 6, 7],
}

const getInitialEntries = () => [cucmber, banana]
class St {
    @observable pretty: boolean = false

    @action load = (rawJSON: string) => {
        this.entries = JSON.parse(rawJSON)
    }

    @observable entries: Vegetable[] = getInitialEntries()
    @action addVegetable = () => {
        const newVegetable: Vegetable = {
            available_months: [],
            id: "",
            kind: "fruit",
        }
        this.entries.push(newVegetable)
    }
    @action reset = () => {
        this.entries = getInitialEntries()
    }
    @computed get json() {
        return {
            entries: this.entries,
            pretty: this.pretty,
        }
    }
    static STORAGE_KEY = "state"
    constructor() {
        try {
            const rawJSON = localStorage.getItem(St.STORAGE_KEY)
            if (rawJSON == null) throw new Error("no previous state")
            const json = JSON.parse(rawJSON)
            runInAction(() => {
                this.entries = json.entries
                this.pretty = json.pretty
            })
        } catch (error) {
            console.log("impossible to load previous save")
            console.log(error)
        }

        // autosave
        autorun(() => {
            localStorage.setItem(St.STORAGE_KEY, JSON.stringify(this.json))
        })
    }
}
const st = new St()
const App = observer(() => {
    return (
        <div className="App">
            <div className="row">
                <div className="pane-editor  grow basis1 noshrink">
                    <h1>Editor</h1>
                    <button onClick={() => st.addVegetable()}>ADD</button>
                    <button onClick={() => st.reset()}>RESET</button>
                    <div className="row">
                        <div className="hidden">➖</div>
                        <div className="hidden">🍆</div>
                        <div className="pad"></div>
                        {allMonths.map((m) => (
                            <div className="month-label">{m}</div>
                        ))}
                    </div>
                    {st.entries.map((entry, ix) => (
                        <div className="vegetable row">
                            {/* DELETE BTN */}
                            <div
                                className="clickable"
                                onClick={() => st.entries.splice(ix, 1)}
                            >
                                ➖
                            </div>
                            <div
                                className="clickable"
                                onClick={() => {
                                    entry.kind =
                                        entry.kind === "fruit"
                                            ? "vegetable"
                                            : "fruit"
                                }}
                            >
                                {entry.kind === "fruit" ? "🍑" : "🍆"}
                            </div>
                            {inputText(entry, "id")}
                            {inputMonths(entry)}
                        </div>
                    ))}
                </div>
                <PreviewUI />
            </div>
        </div>
    )
})
const PreviewUI = observer(function PreviewUI() {
    return (
        <div className="pane-json  grow basis1 noshrink col">
            <h1>JSON</h1>
            {inputCheckbox(st, "pretty")}
            <textarea
                className="grow"
                cols={30}
                rows={10}
                onChange={(ev) => st.load(ev.target.value)}
                value={
                    st.pretty
                        ? JSON.stringify(st.entries, null, 4)
                        : JSON.stringify(st.entries)
                }
            ></textarea>
        </div>
    )
})
export default App

const inputText = (owner: any, key: string) => (
    <label className="row line">
        <input
            //
            value={owner[key]}
            type="text"
            onChange={(ev) => (owner[key] = ev.target.value)}
        />
    </label>
)

const inputCheckbox = (owner: any, key: string) => (
    <label className="row line">
        <div className="clickable" onClick={(ev) => (owner[key] = !owner[key])}>
            {owner[key] ? "✅" : "❌"}
        </div>
    </label>
)

const inputMonths = (vegetable: Vegetable) => (
    <label className="row line">
        {/* <div className="label">availability</div> */}
        {allMonths.map((m, ix) => {
            const months = vegetable.available_months
            const index = ix + 1
            const available = months.indexOf(index) >= 0
            return (
                <div
                    className="month-availability clickable"
                    onClick={(ev) => {
                        // if already available
                        if (available) {
                            vegetable.available_months = months.filter(
                                (i) => i !== index
                            )
                        }
                        // if already present, return
                        if (months.includes(index)) return
                        // othwerwise, add it
                        months.push(index)
                        // sort it
                        vegetable.available_months = months.sort()
                        return
                    }}
                >
                    {available ? "✅" : "❌"}
                </div>
            )
        })}
    </label>
)

// prettier-ignore
const allMonths = [ "janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre", ]
