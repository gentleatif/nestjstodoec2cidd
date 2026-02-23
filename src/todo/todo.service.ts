import { Injectable, NotFoundException } from '@nestjs/common';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodoService {
  private readonly todos = new Map<string, Todo>();

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  create(dto: CreateTodoDto): Todo {
    const now = new Date();
    const todo: Todo = {
      id: this.generateId(),
      title: dto.title,
      description: dto.description,
      completed: dto.completed ?? false,
      createdAt: now,
      updatedAt: now,
    };
    this.todos.set(todo.id, todo);
    return todo;
  }

  findAll(): Todo[] {
    return Array.from(this.todos.values());
  }

  findOne(id: string): Todo {
    const todo = this.todos.get(id);
    if (!todo) {
      throw new NotFoundException(`Todo with id "${id}" not found`);
    }
    return todo;
  }

  update(id: string, dto: UpdateTodoDto): Todo {
    const existing = this.findOne(id);
    const updated: Todo = {
      ...existing,
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.completed !== undefined && { completed: dto.completed }),
      updatedAt: new Date(),
    };
    this.todos.set(id, updated);
    return updated;
  }

  remove(id: string): void {
    if (!this.todos.has(id)) {
      throw new NotFoundException(`Todo with id "${id}" not found`);
    }
    this.todos.delete(id);
  }
}
