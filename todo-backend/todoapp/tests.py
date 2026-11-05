from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Todo


class TaskAPITests(APITestCase):
    def setUp(self):
        self.list_url = reverse("tasks-list")

    def detail_url(self, pk):
        return reverse("tasks-detail", args=[pk])

    def test_create_task_applies_defaults(self):
        res = self.client.post(self.list_url, {"title": "Write tests"}, format="json")

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["status"], "Pending")
        self.assertEqual(res.data["priority"], "Medium")
        self.assertEqual(res.data["description"], "")
        self.assertIsNone(res.data["due_date"])

    def test_due_date_is_optional(self):
        res = self.client.post(
            self.list_url, {"title": "No deadline", "due_date": None}, format="json"
        )

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(res.data["due_date"])

    def test_title_is_required(self):
        res = self.client.post(self.list_url, {"title": "   "}, format="json")

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", res.data)

    def test_invalid_status_is_rejected(self):
        res = self.client.post(
            self.list_url, {"title": "Bad", "status": "Done"}, format="json"
        )

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("status", res.data)

    def test_put_updates_all_fields(self):
        todo = Todo.objects.create(title="Old")
        payload = {
            "title": "New",
            "description": "Updated",
            "status": "In Progress",
            "priority": "High",
            "due_date": "2026-12-31",
        }

        res = self.client.put(self.detail_url(todo.pk), payload, format="json")

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        todo.refresh_from_db()
        self.assertEqual(todo.title, "New")
        self.assertEqual(todo.priority, "High")

    def test_patch_updates_only_status(self):
        todo = Todo.objects.create(title="Keep me", priority="High")

        res = self.client.patch(
            self.detail_url(todo.pk), {"status": "Completed"}, format="json"
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        todo.refresh_from_db()
        self.assertEqual(todo.status, "Completed")
        self.assertEqual(todo.title, "Keep me")
        self.assertEqual(todo.priority, "High")

    def test_delete_task(self):
        todo = Todo.objects.create(title="Remove me")

        res = self.client.delete(self.detail_url(todo.pk))

        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Todo.objects.filter(pk=todo.pk).exists())

    def test_list_returns_plain_array(self):
        Todo.objects.create(title="One")

        res = self.client.get(self.list_url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIsInstance(res.data, list)