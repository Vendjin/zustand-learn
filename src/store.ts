import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { produce } from 'immer';

interface ITodo {
    id: string;
    title: string;
    completed: boolean;
}

interface ITodoState {
    todos: ITodo[];
    loading: boolean;
    error: string | null;
    addTodo: (title: string) => void
    toggleTodo: (todoId: string) => void
    fetchTodos: () => void
}

export const useTodos = create<ITodoState>()(
    persist(
        devtools(
            immer((set) => ({
                todos: [
                    { id: '1a', title: "Learn JS", completed: true },
                    { id: '2b', title: "Learn React", completed: false },
                ],
                loading: false,
                error: null,
                addTodo: (title) => {
                    const newTodo = { id: nanoid(), title, completed: false };
                    set((state) => { state.todos.push(newTodo) });
                    //вариант без immer
                    // set({ todos: [...get().todos, newTodo] })
                },
                toggleTodo: (todoId) => set((state) => {
                    //produce для создания новой неизменяемой копии состояния с обновленным списком задач:
                    return produce(state, (draftState) => {
                        const todoToToggle = draftState.todos.find((todo) => todo.id === todoId);
                        if (todoToToggle) {
                            todoToToggle.completed = !todoToToggle.completed;
                        }
                    });
                }),
                // метод без использования immer
                /* toggleTodo: (todoId) => set({
                  todos: get().todos.map(
                    todo => todoId === todo.id
                      ? { ...todo, completed: !todo.completed }
                      : todo
                  )
                }), */
                fetchTodos: async () => {
                    set({loading: true})

                    try {
                        const res = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=10');
                        if (!res.ok) throw new Error('Failed to fetch! Try again.')
                        // set({todos: [ await res.json()], error: null})
                        const result = await res.json();
                        set((state) => {state.todos.push(...result), state.error = null});
                    }catch (error){
                        set({error: (error as Error).message})
                    } finally{
                        set({loading: false})
                    }
                }
            }))),
        {
            name: 'todo-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);


interface IUseFilter {
    filter: string
    setFilter: (value: string) => void
}
export const useFilter = create<IUseFilter>()(
    devtools(
        immer(set => ({
            filter: 'all',
            // setFilter с использование immer
            setFilter: (filter) => set(state => {
                state.filter = filter
            })

        }))
    )
)

// без использования immer
/* export const useFilter = create(set => ({
    filter: 'all',
    setFilter: (value) => set({ filter: value })
  })) */